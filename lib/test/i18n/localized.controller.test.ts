import { elementUpdated, fixture, fixtureCleanup } from "@open-wc/testing";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { addLocalizedController, loadTranslations, localized, translate } from "../../src/i18n";
import { translations } from "./store.test";

/**
 * Function based controller attachment (JavaScript or TypeScript)
 */
class FunctionLocalized extends LitElement {
  constructor() {
    super();
    addLocalizedController(this);
  }

  protected override render() {
    return html`
      <p>
        ${translate("first")}
      </p>
    `;
  }
}

customElements.define("function-localized", FunctionLocalized);

/**
 * Decorator based controller attachment (TypeScript only)
 */
@customElement("decorator-localized")
@localized()
class DecoratorLocalized extends LitElement {
  protected override render() {
    return html`
      <p>
        ${translate("second")}
      </p>
    `;
  }
}

// Mock the readonly navigator.language property
const languageGetter = vi.spyOn(navigator, "language", "get");

// Function localized component
let functionLocalized: HTMLElement;

// Decorator localized component
let decoratorLocalized: HTMLElement;

describe.concurrent("[lib] i18n/localized", () => {
  beforeAll(async () => {
    loadTranslations(translations);

    functionLocalized = await fixture<HTMLElement>(html`<function-localized></function-localized>`);

    decoratorLocalized = await fixture<HTMLElement>(
      html`<decorator-localized></decorator-localized>`,
    );
  });

  /**
   * Change the browser language. We have to manually trigger of the `languagechange` event as
   * the mock does not cause it to be triggered automatically like the real thing would.
   * @param language the new browser language
   */
  const changeBrowserLanguage = (language: string) => {
    languageGetter.mockReturnValue(language);
    dispatchEvent(new Event("languagechange"));
  };

  /**
   * Get the currently displayed text in the given `component`.
   * @param component the component
   * @returns the text currently displayed by the component
   */
  const getComponentText = (component: HTMLElement) =>
    component.shadowRoot?.querySelector("p")?.textContent;

  it("should update the rendered translation when the browser language changes", async () => {
    // Default locale is english when the browser language is not supported
    expect(getComponentText(functionLocalized)).toContain("Some text");
    expect(getComponentText(decoratorLocalized)).toContain("Another one");

    // Switch the browser to french
    changeBrowserLanguage("fr");

    // Wait for the components to update
    await elementUpdated(functionLocalized);
    await elementUpdated(decoratorLocalized);

    // Translations should now be in french
    expect(getComponentText(functionLocalized)).toContain("Exemple de texte");
    expect(getComponentText(decoratorLocalized)).toContain("Un autre texte");

    // Switch browser to german (not supported)
    changeBrowserLanguage("de");

    // Wait for the components to update
    await elementUpdated(functionLocalized);
    await elementUpdated(decoratorLocalized);

    // Translations should still be in french (last supported locale that was used)
    expect(getComponentText(functionLocalized)).toContain("Exemple de texte");
    expect(getComponentText(decoratorLocalized)).toContain("Un autre texte");

    // Switch browser to english
    changeBrowserLanguage("en");

    // Wait for the components to update
    await elementUpdated(functionLocalized);
    await elementUpdated(decoratorLocalized);

    // Translations should be back to english
    expect(getComponentText(functionLocalized)).toContain("Some text");
    expect(getComponentText(decoratorLocalized)).toContain("Another one");

    // This line just allows for the `hostDisconnected` callback of the `localized` controller to
    // be executed during the test which improves the coverage report. There's no logic to test
    // in this callback anyway.
    fixtureCleanup();
  });
});
