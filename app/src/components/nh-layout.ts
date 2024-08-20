import type NhSidebar from "$components/nh-sidebar";
import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import "$components/nh-header";
import "$components/nh-sidebar";
import "$components/nh-footer";

import "$pages/home-page";

/**
 * Web component for the app's layout defined as a `nh-layout` HTML tag.
 */
@customElement("nh-layout")
export default class NhLayout extends LitElement {
  /**
   * Element representing the sidebar.
   */
  @query("nh-sidebar")
  nhSidebar!: NhSidebar;

  /**
   * Lifecycle method that runs once after the first render of the component.
   * Used to setup the listener for the menu button click in the header component.
   */
  protected override firstUpdated() {
    this.addEventListener("nh-menu-button-click", () => {
      this.nhSidebar.drawer.show();
    });
  }

  /**
   * Render the header's content.
   * @returns the DOM of the layout component
   */
  protected override render() {
    return html`
      <nh-header></nh-header>
      <nh-sidebar></nh-sidebar>
      <main>
        <slot>
          <home-page></home-page>
        </slot>
      </main>
      <nh-footer></nh-footer>
    `;
  }

  /**
   * Styles for the component's DOM.
   */
  static override styles = css`
    :host {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    main {
      max-width: 1200px;
      width: calc(100% - var(--sl-spacing-small) * 2);
      margin: 0 auto;
      padding: var(--sl-spacing-small);
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    sl-spinner {
      font-size: var(--sl-font-size-2x-large);
    }
  `;
}
