import { beforeAll, describe, expect, it } from "vitest";
import { loadTranslations, translate } from "../../src/i18n";

export const translations = {
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

describe.concurrent("[lib] i18n/store", () => {
  beforeAll(() => {
    loadTranslations(translations);
  });

  it("should handle simple translations", () => {
    expect(translate("first")).toContain("Some text");
    expect(translate("second")).toContain("like %firstVar% and %secondVar%");
  });

  it("should handle translations with variables", () => {
    const result = translate("second", { vars: { firstVar: "apples", secondVar: "oranges" } });
    expect(result).toContain("like apples and oranges");
  });

  it("should display `Translation missing` for invalid keys", () => {
    // Non existing key
    expect(translate("someKey")).toContain("Translation missing");

    // When the value of a key before the last one is a string
    expect(translate("first.second")).toContain("Translation missing");

    // When the key exists but its value is not a string
    expect(translate("subKey")).toContain("Translation missing");
  });

  it("should handle nested keys", () => {
    const result = translate("nested.subKey.third", { vars: { thirdVar: "strawberries" } });
    expect(result).toContain("with a variable: strawberries");
  });

  it("should truncate the translation", () => {
    const truncated = translate("second", { maxLength: 21 });
    expect(truncated).toMatch(/with some\.{3}$/);
  });

  it("should translate in the given locale", () => {
    expect(translate("first", { locale: "fr" })).toContain("Exemple de texte");
  });
});
