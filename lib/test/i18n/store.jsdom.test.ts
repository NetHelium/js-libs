// @vitest-environment jsdom

import { describe, expect, it, vi } from "@net-helium/tools/test";
import { setLocale } from "../../src/i18n/index.js";

const languageGetter = vi.spyOn(window.navigator, "language", "get");

const changeBrowserLanguage = (language: string) => {
  languageGetter.mockReturnValue(language);
};

describe.concurrent("[lib] i18n/store (jsdom)", () => {
  it("should set the locale in the store according to the browser language if supported", () => {
    const rootElement = document.documentElement;

    /**
     * Locale is `fr` if the browser is in english but the root element says french.
     */
    changeBrowserLanguage("en");
    expect(window.navigator.language).toEqual("en");
    rootElement.lang = "fr";
    expect(setLocale()).toEqual("fr");

    /**
     * Locale is `fr` if the browser is in french and the root element has an unsupported value.
     */
    changeBrowserLanguage("fr");
    expect(window.navigator.language).toEqual("fr");
    rootElement.lang = "de";
    expect(setLocale()).toEqual("fr");

    /**
     * Locale is `fr` if both the browser and the root element have an unsupported locale because
     * of the fallback value.
     */
    changeBrowserLanguage("de");
    expect(window.navigator.language).toEqual("de");
    expect(setLocale({ fallback: "fr" })).toEqual("fr");

    /**
     * Without any fallback given, the default locale is `en`.
     */
    expect(setLocale()).toEqual("en");
  });
});
