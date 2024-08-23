import NhPage from "$components/nh-page";
import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import "@net-helium/hc-forms";

@customElement("hc-forms--multiple-forms")
export default class HcFormsMultipleForms extends NhPage {
  /**
   * Page metadata.
   */
  static override metadata = {
    title: "Multiple forms",
    position: 2,
  };

  /**
   * Page content.
   * @returns the DOM of the page
   */
  protected override render() {
    return html`
      <h1>Multiple forms</h1>
      <hc-form
        url="https://helium-connect.fr/player/5b759aaa441eec5fb400002d/fid/6670261db1ff6324515dc189"
      ></hc-form>
      <hc-form
        url="https://helium-connect.fr/player/5b759aaa441eec5fb400002d/fid/66c5dcaab1ff63b9351bd3dc"
      ></hc-form>
    `;
  }

  /**
   * Page styles.
   */
  static override styles = css`
    h1 {
      text-align: center;
    }
    hc-form:not(:last-child) {
      margin-bottom: 15px;
    }
  `;
}
