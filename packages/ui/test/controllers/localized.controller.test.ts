import { loadTranslations, translate } from "@net-helium/lib/i18n";
import { elementUpdated, fixture, fixtureCleanup } from "@open-wc/testing";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { attachLocalizedController, localized } from "../../src/controllers/index.js";

describe.concurrent("[ui] controllers/localized", () => {
  // Mock the readonly navigator.language property
  const languageGetter = vi.spyOn(navigator, "language", "get");

  /**
   * Change the browser language. We have to manually trigger of the `languagechange` event as
   * the mock does not cause it to be triggered automatically like the real thing would.
   * @param language the new browser language
   */
  const changeBrowserLanguage = (language: string) => {
    languageGetter.mockReturnValue(language);
    dispatchEvent(new Event("languagechange"));
  };

  const translations = {
    en: {
      function: "Some text",
      decorator: "Another text",
    },
    fr: {
      function: "Exemple de texte",
      decorator: "Un autre texte",
    },
  };

  /**
   * Function based controller attachment
   */
  class FunctionLocalized extends LitElement {
    constructor() {
      super();
      attachLocalizedController(this);
    }

    protected override render(): unknown {
      return html`
        <p>
          ${translate("function")}
        </p>
      `;
    }
  }

  customElements.define("function-localized", FunctionLocalized);

  /**
   * Decorator based controller attachment
   */
  @customElement("decorator-localized")
  @localized()
  // @ts-ignore
  class DecoratorLocalized extends LitElement {
    protected override render(): unknown {
      return html`
        <p>
          ${translate("decorator")}
        </p>
      `;
    }
  }

  // Function localized component
  let functionLocalized: HTMLElement;

  // Decorator localized component
  let decoratorLocalized: HTMLElement;

  /**
   * Get the currently displayed text in the given `component`.
   * @param component the component
   * @returns the text currently displayed by the component
   */
  const getComponentText = (component: HTMLElement) =>
    component.shadowRoot?.querySelector("p")?.textContent;

  beforeAll(async () => {
    loadTranslations(translations);

    functionLocalized = await fixture(html`<function-localized></function-localized>`);
    decoratorLocalized = await fixture(html`<decorator-localized></decorator-localized>`);
  });

  it("should update the rendered translation when the browser language changes", async () => {
    // Default locale is english in the JSDOM environment
    expect(getComponentText(functionLocalized)).toContain("Some text");
    expect(getComponentText(decoratorLocalized)).toContain("Another text");

    // Switch the browser to french
    changeBrowserLanguage("fr");
    expect(navigator.language).toEqual("fr");

    // Wait for the components to update
    await elementUpdated(functionLocalized);
    await elementUpdated(decoratorLocalized);

    // Translations should now be in french
    expect(getComponentText(functionLocalized)).toContain("Exemple de texte");
    expect(getComponentText(decoratorLocalized)).toContain("Un autre texte");

    // Switch browser to german (not supported)
    changeBrowserLanguage("de");
    expect(navigator.language).toEqual("de");

    // Wait for the components to update
    await elementUpdated(functionLocalized);
    await elementUpdated(decoratorLocalized);

    // Translations should still be in french (last supported locale that was used)
    expect(getComponentText(functionLocalized)).toContain("Exemple de texte");
    expect(getComponentText(decoratorLocalized)).toContain("Un autre texte");

    // Switch browser to english
    changeBrowserLanguage("en");
    expect(navigator.language).toEqual("en");

    // Wait for the components to update
    await elementUpdated(functionLocalized);
    await elementUpdated(decoratorLocalized);

    // Translations should be in english again
    expect(getComponentText(functionLocalized)).toContain("Some text");
    expect(getComponentText(decoratorLocalized)).toContain("Another text");

    // This line just allows for the `hostDisconnected` callback of the `localized` controller to
    // be executed during the test which improves the coverage report. There's no logic to test
    // in this callback anyway.
    fixtureCleanup();
  });
});
