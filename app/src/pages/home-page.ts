import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * Special page for the home page (path `/`).
 */
@customElement("home-page")
export default class HomePage extends LitElement {
  /**
   * Page content.
   * @returns the DOM of the page
   */
  protected override render() {
    const command = "pnpm --filter app generate page";

    return html`
      <h1>Welcome</h1>
      <p>Browse existing pages by opening the menu or create a new one using this command:</p>
      <div class="code">
        <code>${command}</code>
        <sl-copy-button value="${command}"></sl-copy-button>
      </div>
    `;
  }

  /**
   * Page styles.
   */
  static override styles = css`
    :host {
      text-align: center;
    }
    h1 {
      font-size: var(--sl-font-size-3x-large);
      font-weight: normal;
      margin-top: 0;
    }
    p {
      margin-bottom: var(--sl-spacing-large);
    }
    .code {
      display: flex;
      width: 330px;
      font-size: var(--sl-font-size-medium);
      margin: 0 auto;
      padding: var(--sl-spacing-x-small) var(--sl-spacing-x-small);
      padding-left: var(--sl-spacing-medium);
      background-color: var(--sl-color-neutral-100);
      border-radius: var(--sl-border-radius-large);
      box-shadow: var(--sl-shadow-small);
      justify-content: space-between;
      align-items: center;
    }
  `;
}
