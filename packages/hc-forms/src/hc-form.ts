import {
  getHcFormIdFromUrl,
  getHcFormSlugFromUrl,
  hcProcessPlaceholders,
} from "@net-helium/lib/helium-connect";
import { loadTranslations, setLocale, store, translate } from "@net-helium/lib/i18n";
import {
  getHostPathFromUrl,
  getMatchingParamsFromUrl,
  getUrlWithParams,
} from "@net-helium/lib/utils";
import { LitElement, type PropertyValues, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import en from "./i18n/en.json";
import fr from "./i18n/fr.json";

/**
 * Data sent by Hélium Connect containing the needed information about the form rendered in the
 * component.
 */
type HcFormEventMessage = {
  /**
   * The form url (the full url as it would appear in the browser's address bar).
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
   * The form url (the host and pathname part of the url).
   */
  formUrl?: string;

  /**
   * The type of the event triggered in the form.
   */
  type:
    | "first_load" // After the initial load of the form
    | "conditional" // After the conditional addition or removal of questions
    | "next_block" // After arriving at the next page of questions
    | "errors" // After validation errors are displayed
    | "check_page" // After arriving at the summary page
    | "confirmation" // After arriving at the confirmation page
    | "orientation_change" // After a screen rotation on a mobile device
    | "resize"; // After a window resize

  /**
   * The computed height of the form.
   */
  height: number;
};

/**
 * HCT data if the host page uses HCT for tracking.
 */
type HctData = {
  /**
   * The current browser token.
   */
  browserToken: string;

  /**
   * The current session token.
   */
  sessionToken: string;
};

// Load the translations in the i18n store
loadTranslations({ en, fr });

/**
 * Hélium Connect form component.
 *
 * @tag hc-form
 *
 * @property {string} url - The url of the form
 * @property {number} scrollOffset - Offset for the automatic scroll to the top of the form
 * @property {number} paddingBottom - Extra space added to the calculated height of the form
 *
 * @csspart iframe - The iframe HTML element displaying the form
 * @csspart error-msg - The error message displayed if the form url is invalid
 */
@customElement("hc-form")
export default class HcForm extends LitElement {
  /**
   * url of the form.
   *
   * @default undefined
   */
  @property({ type: String, reflect: true })
  url?: string;

  /**
   * Offset for the scroll to the top of the component after a page change inside the form.
   *
   * @default 0
   */
  @property({ type: Number, attribute: "scroll-offset" })
  scrollOffset = 0;

  /**
   * Extra space in pixels that will be added to the computed height of the form.
   *
   * @default 0
   */
  @property({ type: Number, attribute: "padding-bottom" })
  paddingBottom = 0;

  /**
   * Current HCT data extracted from the host page.
   */
  @state()
  hct?: HctData;

  /**
   * Current height of the form computed by Hélium Connect.
   */
  @state()
  private height = 0;

  /**
   * Unique form identifier extracted from its url.
   */
  #formIdentifier?: string;

  /**
   * Final url of the form that will be loaded into the generated iframe. The value is the same as
   * the url property but enriched with parameters extracted from the host page.
   */
  #src = "about:blank";

  /**
   * Timeout reference used to debounce the request when asking Hélium Connect for the new height
   * of the form after a window resize or a screen orientation change.
   */
  #resizeTimeout?: ReturnType<typeof setTimeout>;

  /**
   * Mutation observer to watch changes in the `lang` attribute of the root element in order to
   * update the active locale in the i18n store.
   */
  #observer: MutationObserver;

  /**
   * Iframe HTML element displaying the form.
   */
  @query("iframe")
  private iframe?: HTMLIFrameElement;

  constructor() {
    super();

    this.#observer = new MutationObserver(this.#languageChangedHandler);

    // Try to get the HCT data before the first render if HCT is already loaded in the host page
    this.#hctUpdatedHandler();
  }

  /**
   * Handler to update the height of the form and manage the scrolling at the top of it when
   * receiving a form event from Hélium Connect.
   *
   * @param e the message event sent by Hélium Connect
   */
  #hcMessageHandler = (e: MessageEvent<HcFormEventMessage>) => {
    const { url, formId, formSlug, formUrl, height, type } = e.data;
    if (!type) return;

    if (
      this.#formIdentifier &&
      ((url &&
        (getHcFormIdFromUrl(url) === this.#formIdentifier ||
          getHcFormSlugFromUrl(url) === this.#formIdentifier ||
          getHostPathFromUrl(url) === this.#formIdentifier)) ||
        formId === this.#formIdentifier ||
        formSlug === this.#formIdentifier ||
        formUrl === this.#formIdentifier)
    ) {
      this.height = height + this.paddingBottom;

      if (["next_block", "errors", "check_page", "confirmation"].includes(type)) {
        const iframeY = this.iframe!.getBoundingClientRect().top;
        const offsetY = iframeY + window.scrollY - this.scrollOffset;
        window.scrollTo({ top: offsetY, behavior: "smooth" });
      }
    }
  };

  /**
   * Send a debounced request to get the updated height of the form from Hélium Connect after
   * each resize of the window.
   *
   * @param e the resize event
   */
  #resizeHandler = (e: Event) => {
    if (!this.iframe) return;
    if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout);

    this.#resizeTimeout = setTimeout(() => {
      this.iframe?.contentWindow?.postMessage({ type: e.type }, "*");
    }, 250);
  };

  /**
   * Enrich the form url with data extracted from the host page.
   *
   * @param originalUrl the original form url
   * @returns the enriched form url
   */
  #buildFinalUrl = (originalUrl: string) => {
    // Extract tracking params from the hosting page url
    let params = getMatchingParamsFromUrl(location.href, /^utm_/, /^hc_/);

    // Add the host page domain
    params = { ...params, ldom: location.host };

    // Add the host page cookie preferences if they exist. The cookie preferences set by the
    // cookies banner that could be used on Hélium Connect landing pages for example.
    if (window.cookies) {
      params = {
        ...params,
        ...Object.fromEntries(
          Object.entries(window.cookies).map(([k, v]) => [`ck-${k}`, v ? "1" : "0"]),
        ),
      };
    }

    // Add HCT data if any
    if (this.hct) {
      params = {
        ...params,
        hct_browser: this.hct.browserToken,
        hct_session: this.hct.sessionToken,
      };
    }

    return getUrlWithParams(hcProcessPlaceholders(originalUrl, params), params);
  };

  /**
   * Handler called if the language was changed. A new render of the host component is scheduled if
   * the locale changes.
   */
  #languageChangedHandler = () => {
    const locale = store.locale;
    store.locale = setLocale({ fallback: store.locale });

    // Avoid doing a useless render if the new locale is the same
    if (store.locale !== locale) this.requestUpdate();
  };

  /**
   * Get the latest HCT tokens from the host page and update them in the form if needed.
   */
  #hctUpdatedHandler = () => {
    const browserToken = window.hct?.browser_token();
    const sessionToken = window.hct?.session_token();

    if (!browserToken || !sessionToken) return;
    if (this.hct?.browserToken === browserToken && this.hct?.sessionToken === sessionToken) return;

    this.hct = { browserToken, sessionToken };
  };

  /**
   * Setup event listeners on the window and a mutation observer for the `lang` attribute of the
   * root element when the component is added to the host page.
   */
  override connectedCallback() {
    super.connectedCallback();

    addEventListener("message", this.#hcMessageHandler);
    addEventListener("resize", this.#resizeHandler);
    addEventListener("languagechange", this.#languageChangedHandler);
    addEventListener("hct.tokensUpdate", this.#hctUpdatedHandler);

    this.#observer.observe(document.documentElement, {
      subtree: false,
      childList: false,
      attributeFilter: ["lang"],
    });
  }

  /**
   * Remove event listeners on the window and stop the observer to allow for the component to be
   * garbage collected when removed from the host page.
   */
  override disconnectedCallback() {
    super.disconnectedCallback();

    removeEventListener("message", this.#hcMessageHandler);
    removeEventListener("resize", this.#resizeHandler);
    removeEventListener("languagechange", this.#languageChangedHandler);
    removeEventListener("hct.tokensUpdate", this.#hctUpdatedHandler);

    this.#observer.disconnect();
  }

  /**
   * Update the form identifier and the final url to load into the iframe when the `url` or the
   * `hct` property changes. Also update the height if the `paddingBottom` property changes.
   *
   * @param changedProperties a map of the properties that have changed since the last render
   */
  protected override willUpdate(changedProperties: PropertyValues<this>) {
    if (this.url && (changedProperties.has("url") || changedProperties.has("hct"))) {
      this.#formIdentifier =
        getHcFormIdFromUrl(this.url) ||
        getHcFormSlugFromUrl(this.url) ||
        getHostPathFromUrl(this.url);

      if (this.#formIdentifier) {
        this.#src = this.#buildFinalUrl(this.url);
      }
    }

    if (!this.url) {
      this.#formIdentifier = undefined;
    }

    if (changedProperties.has("paddingBottom")) {
      this.height += this.paddingBottom - changedProperties.get("paddingBottom")!;
    }
  }

  /**
   * The content of the component.
   *
   * @returns the component's DOM
   */
  protected override render() {
    if (!this.#formIdentifier) {
      return html`
        <p part="error-msg" role="alert">
          ${translate("errorMsg")}
        </p>
      `;
    }

    return html`
      <iframe
        part="iframe"
        title=${translate("iframeTitle", { vars: { formId: this.#formIdentifier } })}
        src=${this.#src}
        style=${`height: ${this.height}px;`}
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
    [role="alert"] {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
        sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      text-align: center;
      font-size: 1rem;
      color: #ff0000;
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
    hct?: {
      create: (tag: string, options?: unknown) => void;
      session_token: () => string;
      browser_token: () => string;
    };
  }
}
