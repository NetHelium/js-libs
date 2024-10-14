import { getHcFormIdFromUrl, getHcFormSlugFromUrl } from "@net-helium/lib/helium-connect";
import { translate } from "@net-helium/lib/i18n";
import {
  getHostPathFromUrl,
  getPrefixedParamsFromUrl,
  getUrlWithParams,
} from "@net-helium/lib/utils";
import { localized } from "@net-helium/ui/controllers";
import { LitElement, type PropertyValues, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

/**
 * Data sent by Hélium Connect containing the needed information about the form rendered in the
 * component.
 */
type HcFormEventMessage = {
  /**
   * The form URL (the full URL as it would appear in the browser's address bar).
   */
  url?: string;

  /**
   * The form ID.
   */
  formId?: string;

  /**
   * The form slug.
   */
  formSlug?: string;

  /**
   * The form URL (the host and pathname part of the URL).
   */
  formUrl?: string;

  /**
   * The type of the event triggered in the form.
   */
  type:
    | "first_load" // After the initial load of the form
    | "conditional" // After a conditional display of a block of questions
    | "next_block" // After arriving at the next page of questions
    | "check_page" // After arriving at the summary page of the given responses
    | "confirmation" // After arriving at the confirmation page
    | "errors" // After validation errors are detected in the form
    | "resize"; // After a request was sent because of a window resize

  /**
   * The calculated height of the form.
   */
  height: number;
};

/**
 * Hélium Connect form component.
 *
 * @tag hc-form
 *
 * @property url - The form's URL
 * @property scrollOffset - Offset for the automatic scroll to the top of the form
 * @property paddingBottom - Extra space added to the calculated height of the form
 *
 * @csspart iframe - The iframe HTML element displaying the form
 * @csspart error-msg - The error message displayed if the form URL is invalid
 */
@customElement("hc-form")
@localized()
export default class HcForm extends LitElement {
  /**
   * URL of the form.
   */
  @property({ type: String, reflect: true })
  url?: string;

  /**
   * Offset for the scroll to the top of the form after a page change inside the form.
   *
   * @default 0
   */
  @property({ type: Number, reflect: true, attribute: "scroll-offset" })
  scrollOffset = 0;

  /**
   * Extra space in pixels that will be added to the calculated height of the form.
   *
   * @default 0
   */
  @property({ type: Number, reflect: true, attribute: "padding-bottom" })
  paddingBottom = 0;

  /**
   * Unique form identifier extracted from its URL.
   */
  #formIdentifier?: string;

  /**
   * Final URL of the form that will be loaded. The value is the same as the url property but
   * enriched with tracking parameters from the host page.
   */
  #src = "about:blank";

  /**
   * Current height of the form received from Hélium Connect.
   */
  @state()
  private _height = 0;

  /**
   * Iframe HTML element displaying the form.
   */
  @query("iframe")
  private _iframe!: HTMLIFrameElement;

  /**
   * Timeout reference used to debounce the request to Hélium Connect when asking for the new
   * height of the form after a window resize.
   */
  #resizeTimeout?: ReturnType<typeof setTimeout>;

  /**
   * Handler to update the height of the form and manage the scrolling at the top of it when
   * receiving a form event from Hélium Connect.
   * @param e the message event sent by Hélium Connect
   */
  #hcMessageHandler = (e: MessageEvent<HcFormEventMessage>) => {
    if (!this._iframe) return;
    const { url, formId, formSlug, formUrl, height, type } = e.data;
    if (!type) return;

    if (
      this.#formIdentifier &&
      ((url &&
        (getHcFormIdFromUrl(url) === this.#formIdentifier ||
          getHcFormSlugFromUrl(url) === this.#formIdentifier ||
          getHostPathFromUrl(url) === this.#formIdentifier)) ||
        (formId && formId === this.#formIdentifier) ||
        (formSlug && formSlug === this.#formIdentifier) ||
        (formUrl && formUrl === this.#formIdentifier))
    ) {
      this._height = height + this.paddingBottom;

      if (["next_block", "check_page", "confirmation", "errors"].includes(type)) {
        const iframeY = this._iframe.getBoundingClientRect().top;
        const offsetY = iframeY + window.scrollY - this.scrollOffset;
        window.scrollTo({ top: offsetY, behavior: "smooth" });
      }
    }
  };

  /**
   * Send a debounced request to get the updated height of the form from Hélium Connect after
   * each resize of the window.
   * @param e the resize event
   */
  #resizeHandler = (e: Event) => {
    if (!this._iframe) return;
    if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout);

    this.#resizeTimeout = setTimeout(() => {
      this._iframe.contentWindow?.postMessage({ type: e.type }, "*");
    }, 250);
  };

  /**
   * Enrich the form url with the host page tracking data.
   * @param originalUrl the original form url
   * @returns the enriched form url
   */
  #buildFinalUrl = (originalUrl: string) => {
    // Extract tracking params from the hosting page url
    let params = getPrefixedParamsFromUrl(location.href, "utm_", "hc_");

    // Add the host page domain
    params = { ...params, ldom: location.host };

    // Add the host page cookie preferences if they exist. The cookie preferences set by the
    // cookies banner that could be used on our landing pages for example.
    if (window.cookies) {
      params = {
        ...params,
        ...Object.fromEntries(
          Object.entries(window.cookies).map(([k, v]) => [`ck-${k}`, v ? "1" : "0"]),
        ),
      };
    }

    return getUrlWithParams(originalUrl, params);
  };

  /**
   * Setup event listeners on the window when the component is added to the host page.
   */
  override connectedCallback() {
    super.connectedCallback();

    addEventListener("message", this.#hcMessageHandler);
    addEventListener("resize", this.#resizeHandler);
  }

  /**
   * Remove event listeners on the window to allow for the component to be garbage collected
   * when removed from the host page.
   */
  override disconnectedCallback() {
    super.disconnectedCallback();

    removeEventListener("message", this.#hcMessageHandler);
    removeEventListener("resize", this.#resizeHandler);
  }

  /**
   * Update the form identifier and the final url to load into the iframe when the `url` property
   * changes. Also update the height if the `paddingBottom` property changes.
   * @param changedProperties a map of the properties that have changed since the last render
   */
  protected override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("url") && this.url) {
      this.#formIdentifier =
        getHcFormIdFromUrl(this.url) ||
        getHcFormSlugFromUrl(this.url) ||
        getHostPathFromUrl(this.url);

      if (this.#formIdentifier) {
        this.#src = this.#buildFinalUrl(this.url);
      }
    }

    if (changedProperties.has("paddingBottom")) {
      this._height += this.paddingBottom - changedProperties.get("paddingBottom")!;
    }
  }

  /**
   * Component content.
   * @returns the component's DOM
   */
  protected override render() {
    if (!this.#formIdentifier) {
      return html`
        <p part="error-msg">
          ${translate("errorMsg")}
        </p>
      `;
    }

    return html`
      <iframe
        part="iframe"
        title=${translate("iframeTitle", { vars: { formId: this.#formIdentifier } })}
        src=${this.#src}
        style=${`height: ${this._height}px;`}
      ></iframe>
    `;
  }

  /**
   * Default styles of the component.
   */
  static override styles = css`
    :host {
      display: block;
    }
    p {
      text-align: center;
      font-family: var(--hc-forms-error-font-family, Verdana, Arial, sans-serif);
      font-size: var(--hc-forms-error-font-size, 1rem);
      color: var(--hc-forms-error-color, #ff0000);
    }
    iframe {
      border: none;
      width: 100%;
    }
  `;
}

declare global {
  interface Window {
    cookies?: Record<string, boolean>;
  }
}
