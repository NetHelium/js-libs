import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * Special page for the 404 page.
 */
@customElement("not-found")
export default class HomePage extends LitElement {
  /**
   * Page content.
   * @returns the DOM of the page
   */
  protected override render() {
    return html`
      <div class="container">
        <h1>Page Not Found (404)</h1>
        <p>The requested page does not exist!</p>
        <a href="/">
          <sl-button variant="primary">Go Home</sl-button>
        </a>
      </div>
    `;
  }

  /**
   * Page styles.
   */
  static override styles = css`
    .container {
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
    a {
      display: inline-block;
    }
  `;
}
