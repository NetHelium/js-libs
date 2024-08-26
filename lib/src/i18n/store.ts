import type { NestedStringObject, StringObject } from "../types";

// Supported locales
const locales = ["en", "fr"] as const;

/**
 * A `Locale` has to be one of the supported locales.
 */
type Locale = (typeof locales)[number];

/**
 * Object containing all the translations for all the supported locales.
 */
type TranslationObject = {
  [key in Locale]: NestedStringObject;
};

/**
 * I18n data store.
 */
type I18nStore = {
  /**
   * The currently active locale.
   */
  locale: Locale;

  /**
   * Translations loaded in the store.
   */
  dictionary: TranslationObject;
};

/**
 * Options passed to the translate function.
 */
type TranslateOptions = {
  /**
   * The values of the translation's placeholders (variables).
   */
  vars?: StringObject;

  /**
   * The maximum length of the translation (it will be truncated if necessary).
   */
  maxLength?: number;

  /**
   * Force a specific locale to be used instead of the currently active one.
   */
  locale?: Locale;
};

/**
 * Set the currently active locale by following the browser language if supported. If the browser
 * language is not supported, the `previousLocale` will be active if passed. The default locale (en)
 * will be active otherwise.
 * @param previousLocale the previously active locale
 * @returns the new locale to use
 */
export const setLocale = (previousLocale?: Locale): Locale => {
  const browserLanguage = navigator.language.split("-").at(0) as Locale;

  if (locales.includes(browserLanguage)) {
    return browserLanguage;
  }

  return previousLocale ?? "en";
};

const store: I18nStore = {
  locale: setLocale(),
  dictionary: locales.reduce((acc, v) => Object.assign(acc, { [v]: {} }), {} as TranslationObject),
};

/**
 * Load the translations for all supported locales in the i18n store.
 * @param translations the translations to load as a `TranslationObject`
 */
export const loadTranslations = (translations: TranslationObject) => {
  for (const locale of locales) {
    store.dictionary[locale] = translations[locale];
  }
};

/**
 * Translate the given `key` for the currently active locale (or the given `locale` in `options`).
 * @param key the translation key
 * @param options the optional translate options
 * @returns the translation if found or a translation missing message
 */
export const translate = (key: string, options?: TranslateOptions) => {
  const identifiers = key.split(".");
  const vars = options?.vars;
  const maxLength = options?.maxLength;
  const locale = options?.locale ?? store.locale;
  const localeDictionary = store.dictionary[locale];

  let value: NestedStringObject | string | undefined;

  for (const [idx, identifier] of identifiers.entries()) {
    if (idx === 0) {
      value = localeDictionary[identifier];
    } else {
      if (value !== undefined && typeof value !== "string") {
        value = value[identifier];
      }
    }

    if (value === undefined) {
      break;
    }

    if (typeof value === "string") {
      // Verify that we are at the last identifier of the key
      if (identifier !== identifiers.at(-1)) {
        break;
      }

      let result = value as string;

      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          result = result.replaceAll(`%${k}%`, v);
        }
      }

      if (maxLength && result.length > maxLength) {
        return `${result.slice(0, maxLength)}...`;
      }

      return result;
    }
  }

  return `Translation missing for ${key}`;
};

export default store;
