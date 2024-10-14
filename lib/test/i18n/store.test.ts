import { beforeAll, describe, expect, it, vi } from "vitest";
import { loadTranslations, setLocale, translate } from "../../src/i18n/index.js";

describe.concurrent("[lib] i18n/store", () => {
  const translations = {
    en: {
      first: "Some text without any variables",
      second: "Another one with some variables like %firstVar% and %secondVar%",
      nested: {
        subKey: {
          third: "A third example in a nested key with a variable: %thirdVar%",
        },
      },
    },
    fr: {
      first: "Exemple de texte sans aucune variable",
      second: "Un autre texte avec quelques variables comme %firstVar% et %secondVar%",
      nested: {
        subKey: {
          third: "Un troisième exemple dans une sous-clé avec une variable : %thirdVar%",
        },
      },
    },
  };

  const languageGetter = vi.spyOn(navigator, "language", "get");

  const changeBrowserLanguage = (language: string) => {
    languageGetter.mockReturnValue(language);
  };

  beforeAll(() => {
    loadTranslations(translations);
  });

  it("should set the locale in the store according to the browser language if supported", () => {
    // Default browser language in JSDOM is english
    expect(setLocale()).toEqual("en");
    expect(setLocale({ fallback: "fr" })).toEqual("en");

    // Change the browser language to french
    changeBrowserLanguage("fr");
    expect(navigator.language).toEqual("fr");
    expect(setLocale()).toEqual("fr");
    expect(setLocale({ fallback: "en" })).toEqual("fr");

    // Change the browser language to german (not supported)
    changeBrowserLanguage("de");
    expect(navigator.language).toEqual("de");
    expect(setLocale()).toEqual("en");
    expect(setLocale({ fallback: "fr" })).toEqual("fr");
  });

  it("should handle simple translations", () => {
    expect(translate("first")).toContain("Some text");
    expect(translate("second")).toContain("like %firstVar% and %secondVar%");
  });

  it("should handle translations with variables", () => {
    expect(translate("second", { vars: { firstVar: "apples", secondVar: "oranges" } })).toContain(
      "like apples and oranges",
    );
  });

  it("should display `Translation missing` for invalid keys", () => {
    expect(translate("someKey")).toContain("Translation missing");
    expect(translate("first.second")).toContain("Translation missing");
    expect(translate("nested.subKey")).toContain("Translation missing");
  });

  it("should handle nested keys", () => {
    expect(translate("nested.subKey.third", { vars: { thirdVar: "strawberries" } })).toContain(
      "with a variable: strawberries",
    );
  });

  it("should truncate the translation", () => {
    expect(translate("second", { maxLength: 21 })).toMatch(/with some\.{3}$/);
  });

  it("should translate in the given locale", () => {
    expect(translate("first", { locale: "fr" })).toContain("Exemple de texte");
  });
});
