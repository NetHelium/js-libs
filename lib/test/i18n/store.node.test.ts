import { beforeAll, describe, expect, it, vi } from "@net-helium/tools/test";
import { loadTranslations, setLocale, translate } from "../../src/i18n/index.js";

describe("[lib] i18n/store (node)", () => {
  const translations = {
    en: {
      first: "Some text without any variables",
      second: "Another one with some variables like {{ firstVar }} and {{ secondVar }}",
      nested: {
        subKey: {
          third: "A third example in a nested key with a variable: {{ thirdVar }}",
        },
      },
    },
    fr: {
      first: "Exemple de texte sans aucune variable",
      second: "Un autre texte avec quelques variables comme {{ firstVar }} et {{ secondVar }}",
      nested: {
        subKey: {
          third: "Un troisième exemple dans une sous-clé avec une variable : {{ thirdVar }}",
        },
      },
    },
  };

  /**
   * The navigator global was added to node in v21.0.0 as a partial implementation of the
   * browser's `window.navigator` API which means we no longer have to be in a browser-like
   * environment to run tests using the navigator global.
   */
  const languageGetter = vi.spyOn(navigator, "language", "get");

  const changeNavigatorLanguage = (language: string) => {
    languageGetter.mockReturnValue(language);
  };

  beforeAll(() => {
    loadTranslations(translations);
  });

  it("should set the locale in the store according to the navigator language if supported", () => {
    changeNavigatorLanguage("en");
    expect(setLocale()).toEqual("en");
    expect(setLocale({ fallback: "fr" })).toEqual("en");

    // Change the navigator language to french
    changeNavigatorLanguage("fr");
    expect(navigator.language).toEqual("fr");
    expect(setLocale()).toEqual("fr");
    expect(setLocale({ fallback: "en" })).toEqual("fr");

    // Change the navigator language to german (not supported)
    changeNavigatorLanguage("de");
    expect(navigator.language).toEqual("de");
    expect(setLocale()).toEqual("en");
    expect(setLocale({ fallback: "fr" })).toEqual("fr");
  });

  it("should handle simple translations", () => {
    expect(translate("first")).toContain("Some text");
    expect(translate("second")).toContain("like {{ firstVar }} and {{ secondVar }}");
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

  it("should or should not override existing translations", () => {
    const newTranslations = {
      en: {
        third: "A third translation",
      },
      fr: {
        third: "Une troisième traduction",
      },
    };

    // Without override
    loadTranslations(newTranslations);
    expect(translate("first")).not.toContain("Translation missing");
    expect(translate("third")).toContain("third translation");

    // With override
    loadTranslations(newTranslations, true);
    expect(translate("first")).toContain("Translation missing");
    expect(translate("third")).toContain("third translation");
  });
});
