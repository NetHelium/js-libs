import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * Web component for the app's footer defined as a `nh-footer` HTML tag.
 */
@customElement("nh-footer")
export default class NhFooter extends LitElement {
  /**
   * Footer content.
   * @returns the DOM for the footer
   */
  protected override render() {
    return html`
      <footer>
        <sl-divider></sl-divider>

        <div class="content">
          <p class="left">Library Development App</p>
          <p class="right">&copy; Net Hélium ${new Date().getFullYear()}</p>
        </div>
      </footer>
    `;
  }

  /**
   * Footer styles.
   */
  static override styles = css`
    footer > sl-divider {
      --spacing: 0;
    }
    .content {
      display: flex;
      justify-content: space-between;
      padding: 0 var(--sl-spacing-small);
    }
    .content > p {
      margin: var(--sl-spacing-small) 0;
    }
  `;
}
