import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import type NhSidebar from "./nh-sidebar.js";
import "./nh-header.js";
import "./nh-sidebar.js";

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
        <slot></slot>
      </main>
    `;
  }

  /**
   * Styles for the component's DOM.
   */
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }
    main {
      max-width: 1200px;
      width: calc(100% - var(--sl-spacing-small) * 2);
      margin: 0 auto;
      padding: var(--sl-spacing-small);
    }
  `;
}
