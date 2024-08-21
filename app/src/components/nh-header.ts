import type { SlSelect } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

/**
 * Possible options for the theme selector.
 * The `system` option means the theme will follow the preferences set in the browser or the OS.
 */
type ThemeSetting = "system" | "light" | "dark";

/**
 * Possible themes to apply.
 */
export type Theme = "light" | "dark";

/**
 * Web component for the app's header defined as a `nh-header` HTML tag.
 */
@customElement("nh-header")
export default class NhHeader extends LitElement {
  /**
   * Element representing the theme selector.
   */
  @query("sl-select[name='theme']")
  private _themeSelect!: SlSelect;

  /**
   * Current theme selected.
   */
  private _theme: ThemeSetting;

  /**
   * Constructor used to determine the initial theme to load.
   * A listener is also set on `matchMedia` to update the theme when the user changes its
   * preferences in the browser or OS settings (only if the selected theme is `system`).
   */
  constructor() {
    super();

    this._theme = this._getTheme();
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", this._setTheme);
  }

  /**
   * Get the previously selected theme or `system` if no theme was selected.
   * @returns the theme to load
   */
  private _getTheme = (): ThemeSetting => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as ThemeSetting) || "system";
  };

  /**
   * Save the selected theme and notify that the theme has changed.
   */
  private _setTheme = () => {
    const value = this._themeSelect.value;

    // Workaround needed because the value of `sl-select` is initially an array regardless of
    // the presence of the `multiple` attribute.
    if (Array.isArray(value)) {
      this._theme = value.at(0) as ThemeSetting;
    } else {
      this._theme = value as ThemeSetting;
    }

    localStorage.setItem("theme", this._theme);
    let theme: Theme;

    if (this._theme === "system") {
      theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      theme = this._theme;
    }

    this.dispatchEvent(
      new CustomEvent<Theme>("nh-theme-change", {
        bubbles: true,
        composed: true,
        detail: theme,
      }),
    );
  };

  /**
   * Notify that the menu button has been clicked.
   */
  private _menuButtonHandler = () => {
    this.dispatchEvent(
      new Event("nh-menu-button-click", {
        bubbles: true,
        composed: true,
      }),
    );
  };

  /**
   * Lifecycle method that runs once after the first render of the component.
   * Used to apply the initial theme and setup the listener on the theme selector.
   */
  protected override firstUpdated() {
    this._setTheme();
    this._themeSelect.addEventListener("sl-change", this._setTheme);
  }

  /**
   * Header content.
   * @returns the DOM for the header
   */
  protected override render() {
    return html`
      <header>
        <div class="content">
          <div class="left">
            <sl-icon-button name="list" label="Open menu" @click=${this._menuButtonHandler}>
            </sl-icon-button>
            <a href="/">JavaScript libraries</a>
          </div>

          <div class="right">
            <sl-tooltip content="Change theme" placement="left">
              <sl-select name="theme" value="${this._theme}" size="small">
                <sl-option value="system">System</sl-option>
                <sl-divider></sl-divider>
                <sl-option value="light">Light</sl-option>
                <sl-option value="dark">Dark</sl-option>
              </sl-select>
            </sl-tooltip>

            <sl-tooltip content="GitHub repository">
              <a href="https://github.com/NetHelium/js-libs" target="_blank">
                <sl-icon-button name="github"></sl-icon-button>
              </a>
            </sl-tooltip>
          </div>
        </div>

        <sl-divider></sl-divider>
      </header>
    `;
  }

  /**
   * Header styles.
   */
  static override styles = css`
    p {
      margin: 0;
    }
    .content,
    .content > div {
      display: flex;
    }
    .content {
      justify-content: space-between;
    }
    .content > div {
      align-items: center;
    }
    .left a {
      text-decoration: none;
      color: var(--sl-color-neutral-1000);
      transition: color 0.2s ease-in-out;
    }
    .left a:hover {
      color: var(--sl-color-primary-600);
    }
    .left sl-icon-button {
      font-size: var(--sl-font-size-2x-large);
    }
    .right {
      padding-right: var(--sl-spacing-2x-small);
    }
    .right sl-icon-button {
      font-size: var(--sl-font-size-large);
      margin-left: var(--sl-spacing-2x-small);
    }
    .right sl-select {
      width: 115px;
    }
    header > sl-divider {
      --spacing: 0;
    }
  `;
}
