import NhBase from "$components/nh-base";
import type { SlDrawer } from "@shoelace-style/shoelace";
import { css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

/**
 * Web component for the app's sidebar defined as a `nh-sidebar` HTML tag.
 */
@customElement("nh-sidebar")
export default class NhSidebar extends NhBase {
  /**
   * Element representing the drawer.
   */
  @query("sl-drawer")
  drawer!: SlDrawer;

  /**
   * Render the header's content.
   * @returns the DOM of the sidebar component
   */
  protected override render() {
    return html`
      <sl-drawer placement="start" label="JavaScript librairies">
      </sl-drawer>
    `;
  }

  /**
   * Styles for the component's DOM.
   */
  static override styles = css``;
}
