import type { Theme } from "$components/nh-header";
import type NhSidebar from "$components/nh-sidebar";
import configMenu from "$config/menu.json";
import type { PageConfig } from "$root/types";
import { LitElement, css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { html as staticHtml, unsafeStatic } from "lit/static-html.js";
import "$components/nh-header";
import "$components/nh-sidebar";
import "$components/nh-footer";

/**
 * Web component for the app's layout defined as a `nh-layout` HTML tag.
 */
@customElement("nh-layout")
export default class NhLayout extends LitElement {
  /**
   * Sidebar element.
   */
  @query("nh-sidebar")
  private _nhSidebar!: NhSidebar;

  /**
   * List of all pages.
   */
  private _pages: PageConfig[];

  /**
   * HTML tag of the current page.
   */
  @state()
  private _pageTag?: string;

  constructor() {
    super();

    // Get all package scoped pages
    this._pages = Object.entries(configMenu).reduce((acc, [_k, v]) => {
      if (Array.isArray(v)) acc.push(...v);
      return acc;
    }, [] as PageConfig[]);

    // Add the home page
    this._pages.unshift({
      title: "Home page",
      tag: "home-page",
      path: "/",
    });

    // Apply the requested theme
    this.addEventListener("nh-theme-change", (e: CustomEvent<Theme>) => {
      const htmlElementClasses = document.documentElement.classList;

      if (e.detail === "dark") {
        htmlElementClasses.remove("sl-theme-light");
        htmlElementClasses.add("sl-theme-dark");
      } else {
        htmlElementClasses.remove("sl-theme-dark");
        htmlElementClasses.add("sl-theme-light");
      }
    });

    // Handler for the menu button
    this.addEventListener("nh-menu-button-click", () => {
      this._nhSidebar.drawer.show();
    });

    // Handler for the clicks on page links
    this.addEventListener("click", (e: Event) => {
      const targets = e.composedPath() as Element[];

      for (const target of targets) {
        if (target.tagName === "A" && target.getAttribute("href")?.startsWith("/")) {
          e.preventDefault();
          this._nhSidebar.drawer.hide();
          window.history.pushState({}, "", target.getAttribute("href"));
          this._loadPage();
        }
      }
    });

    // Handler when navigating the history (browser back and forward buttons)
    window.addEventListener("popstate", () => {
      this._loadPage();
    });

    // Load initial page
    this._loadPage();
  }

  /**
   * Load the page corresponding to the current path.
   */
  private _loadPage = async () => {
    this._pageTag = undefined;

    const { pathname } = window.location;
    const page = this._pages.find((p) => p?.path === pathname);

    if (!page) {
      await import("$pages/not-found");
      this._pageTag = "not-found";
      return;
    }

    if (page.path === "/") {
      await import("$pages/home-page");
      this._pageTag = "home-page";
      return;
    }

    if (page) {
      await import(/* @vite-ignore */ `../pages${page.path}`);
      this._pageTag = page.tag;
    }
  };

  /**
   * Layout content.
   * @returns the DOM for the layout
   */
  protected override render() {
    return html`
      <nh-header></nh-header>
      <nh-sidebar></nh-sidebar>
      <main>
        ${
          this._pageTag
            ? staticHtml`
                <div class="page-container">
                  <${unsafeStatic(this._pageTag)}></${unsafeStatic(this._pageTag)}>
                </div>
              `
            : html`<sl-spinner></sl-spinner>`
        }
      </main>
      <nh-footer></nh-footer>
    `;
  }

  /**
   * Layout styles.
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
      text-align: center;
    }
    .page-container {
      width: 100%;
    }
  `;
}
