import { addParamsToUrl, getHostPathFromUrl, getPrefixedParamsFromUrl } from "@net-helium/lib";
import { hcFormIdFromUrl, hcFormSlugFromUrl } from "@net-helium/lib/helium-connect";
import { localized, translate } from "@net-helium/lib/i18n";
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
 */
@localized()
@customElement("hc-form")
export default class HcForm extends LitElement {
  /**
   * URL of the form.
   * @default null
   */
  @property({ type: String, reflect: true })
  url: string | null = null;

  /**
   * Offset for the scroll to the top of the form after a page change inside the form.
   * @default 0
   */
  @property({ type: Number, reflect: true, attribute: "scroll-offset" })
  scrollOffset = 0;

  /**
   * Extra space in pixels that will be added to the calculated height of the form.
   * @default 0
   */
  @property({ type: Number, reflect: true, attribute: "padding-bottom" })
  paddingBottom = 0;

  /**
   * Unique form identifier extracted from its URL.
   */
  private _formIdentifier?: string;

  /**
   * Final URL of the form that will be loaded. The value is the same as the url property but
   * enriched with tracking parameters from the host page.
   */
  private _src = "about:blank";

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
  private _resizeTimeout?: ReturnType<typeof setTimeout>;

  /**
   * Handler to update the height of the form and manage the scrolling at the top of it when
   * receiving a form event from Hélium Connect.
   * @param e the message event sent by Hélium Connect
   */
  private _hcMessageHandler = (e: MessageEvent<HcFormEventMessage>) => {
    if (!this._iframe) return;
    const { url, formId, formSlug, formUrl, height, type } = e.data;
    if (!type) return;

    if (
      this._formIdentifier &&
      ((url &&
        (hcFormIdFromUrl(url) === this._formIdentifier ||
          hcFormSlugFromUrl(url) === this._formIdentifier ||
          getHostPathFromUrl(url) === this._formIdentifier)) ||
        (formId && formId === this._formIdentifier) ||
        (formSlug && formSlug === this._formIdentifier) ||
        (formUrl && formUrl === this._formIdentifier))
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
  private _resizeHandler = (e: Event) => {
    if (!this._iframe) return;
    if (this._resizeTimeout) clearTimeout(this._resizeTimeout);

    this._resizeTimeout = setTimeout(() => {
      this._iframe.contentWindow?.postMessage({ type: e.type }, "*");
    }, 250);
  };

  /**
   * Enrich the form url with the host page tracking data.
   * @param originalUrl the original form url
   * @returns the enriched form url
   */
  private _buildFinalUrl = (originalUrl: string) => {
    // Extract tracking params from the hosting page url
    let extraParams = getPrefixedParamsFromUrl(location.href, "utm_", "hc_");

    // Add the host page domain
    extraParams = { ...extraParams, ldom: location.host };

    // Add the host page cookie preferences if they exist. The cookie preferences set by the
    // cookies banner that could be used on our landing pages for example.
    if (window.cookies) {
      extraParams = {
        ...extraParams,
        ...Object.fromEntries(
          Object.entries(window.cookies).map(([k, v]) => [`ck-${k}`, v ? "1" : "0"]),
        ),
      };
    }

    return addParamsToUrl(originalUrl, extraParams, false);
  };

  /**
   * Setup event listeners on the window when the component is added to the host page.
   */
  override connectedCallback() {
    super.connectedCallback();

    window.addEventListener("message", this._hcMessageHandler);
    window.addEventListener("resize", this._resizeHandler);
  }

  /**
   * Remove event listeners on the window to allow for the component to be garbage collected
   * when removed from the host page.
   */
  override disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener("message", this._hcMessageHandler);
    window.removeEventListener("resize", this._resizeHandler);
  }

  /**
   * Update the form identifier and the final url to load into the iframe when the `url` property
   * changes. Also update the height if the `paddingBottom` property changes.
   * @param changedProperties a map of the properties that have changed since the last render
   */
  protected override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("url")) {
      if (this.url) {
        this._formIdentifier =
          hcFormIdFromUrl(this.url) || hcFormSlugFromUrl(this.url) || getHostPathFromUrl(this.url);

        if (this._formIdentifier) {
          this._src = this._buildFinalUrl(this.url);
        }
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
    if (!this._formIdentifier) {
      return html`
        <p part="error-msg">
          ${translate("errorMsg")}
        </p>
      `;
    }

    return html`
      <iframe
        part="iframe"
        title=${translate("iframeTitle", { vars: { formId: this._formIdentifier } })}
        src=${this._src}
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
    cookies?: {
      [key: string]: boolean;
    };
  }
}
