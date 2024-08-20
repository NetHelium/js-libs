import type { SlDrawer } from "@shoelace-style/shoelace";
import { LitElement, type PropertyValues, type TemplateResult, css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";

type MenuEntry = {
  pkg: string;
  links: {
    title: string;
    path: string;
    tag: string;
  }[];
};

/**
 * Web component for the app's sidebar defined as a `nh-sidebar` HTML tag.
 */
@customElement("nh-sidebar")
export default class NhSidebar extends LitElement {
  /**
   * Element representing the drawer.
   */
  @query("sl-drawer")
  drawer!: SlDrawer;

  @query("nav")
  menu!: HTMLElement;

  @state()
  menuEntries?: MenuEntry[];

  loadMenuEntries = async () => {
    const data = await import("../../config/menu.json");

    this.menuEntries = Object.entries(data.default).reduce((acc, [k, v]) => {
      if (Array.isArray(v)) {
        acc.push({ pkg: k, links: v });
      }

      return acc;
    }, [] as MenuEntry[]);
  };

  protected override firstUpdated(_changedProperties: PropertyValues) {
    this.loadMenuEntries();

    this.menu.addEventListener("sl-show", (e) => {
      for (const details of this.menu.querySelectorAll("sl-details")) {
        details.open = e.target === details;
      }
    });
  }

  /**
   * Render the sidebar content.
   * @returns the DOM of the sidebar component
   */
  protected override render() {
    let menuContent: TemplateResult | TemplateResult[];

    if (this.menuEntries) {
      menuContent = this.menuEntries
        .filter(({ links }) => links.length > 0)
        .map(
          ({ pkg, links }) => html`
          <sl-details summary="${pkg}">
            <ul>
              ${links.map(
                ({ title, path }) => html`
                <li>
                  <sl-icon name="chevron-right"></sl-icon>
                  <a href="${path}">${title}</a>
                </li>
              `,
              )}
            </ul>
          </sl-details>
        `,
        );
    } else {
      menuContent = html`
        <div class="loader">
          <sl-spinner></sl-spinner>
        </div>
      `;
    }

    return html`
      <sl-drawer placement="start" label="JavaScript libraries" open>
        <nav>${menuContent}</nav>
      </sl-drawer>
    `;
  }

  /**
   * Styles for the component's DOM.
   */
  static override styles = css`
    sl-drawer::part(body) {
      padding-top: 0;
    }
    nav {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .loader {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    sl-spinner {
      font-size: var(--sl-font-size-2x-large);
    }
    sl-details:not(:last-child) {
      margin-bottom: var(--sl-spacing-small);
    }
    sl-details::part(base) {
      transition: border-color 0.2s ease-in-out;
    }
    sl-details::part(base):hover,
    sl-details[open]::part(base) {
      border-color: var(--sl-color-primary-500);
    }
    sl-details ul {
      list-style-type: none;
      margin: 0;
      padding: 0;
    }
    sl-details ul li:not(:last-child) {
      margin-bottom: var(--sl-spacing-x-small);
    }
    sl-details ul li > sl-icon,
    sl-details ul li > a {
      display: inline-block;
      vertical-align: middle;
    }
    sl-details ul li a {
      text-decoration: none;
      color: var(--sl-color-neutral-1000);
      transition: color 0.2s ease-in-out;
    }
    sl-details ul li a:hover,
    sl-details ul li a.active {
      color: var(--sl-color-primary-600);
    }
  `;
}
