import menuConfig from "$config/menu.json";
import type { SlDrawer } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
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
  menuEntries: MenuEntry[];

  constructor() {
    super();

    this.menuEntries = Object.entries(menuConfig).reduce((acc, [k, v]) => {
      if (Array.isArray(v)) {
        acc.push({ pkg: k, links: v });
      }

      return acc;
    }, [] as MenuEntry[]);
  }

  protected override firstUpdated() {
    this.menu.addEventListener("sl-show", (e) => {
      for (const details of this.menu.querySelectorAll("sl-details")) {
        details.open = e.target === details;
      }
    });
  }

  /**
   * Sidebar content.
   * @returns the DOM for the sidebar
   */
  protected override render() {
    return html`
      <sl-drawer placement="start" label="JavaScript libraries">
        <nav>
        ${this.menuEntries
          .filter(({ links }) => links.length > 0)
          .map(
            ({ pkg, links }) => html`
            <sl-details summary="${pkg}">
              <ul>
                ${links.map(
                  ({ title, path }) => html`
                  <li>
                    <sl-icon name="chevron-right"></sl-icon>
                    <a href="${path}">
                      ${title}
                    </a>
                  </li>
                `,
                )}
              </ul>
            </sl-details>
          `,
          )}
        </nav>
      </sl-drawer>
    `;
  }

  /**
   * Sidebar styles.
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
    sl-details:not([open])::part(base):hover {
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
