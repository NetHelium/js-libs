import { merge } from "lodash-es";
import { isBrowser } from "../utils/environment.js";

/**
 * The list of supported locales.
 */
const locales = ["en", "fr"] as const;

/**
 * A `Locale` has to be one of the supported locales.
 */
export type Locale = (typeof locales)[number];

/**
 * Translation keys have a unknown depth.
 */
type TranslationKeys = { [key: string]: TranslationKeys | string };

/**
 * Object containing all the loaded translations for each supported locale.
 */
type TranslationDictionary = Record<Locale, TranslationKeys>;

/**
 * Set the currently active locale by following the current language if supported.
 *
 * In a browser environment, the `lang` attribute of the root element (the `html` tag) is first
 * checked. If it's not set or its value is not supported, the browser language is used instead if
 * supported.
 *
 * In a node environment, the language of the global navigator object is used if its current value
 * is supported.
 *
 * If none of the languages are set or supported, the new active locale will be determined by the
 * `fallback` option and if no fallback is given, `en` will be used as a last resort.
 *
 * @param options the options
 * @returns the new locale to use
 */
export const setLocale = (options?: {
  /**
   * The fallback locale to use instead of the default one if no locale was detected or supported.
   */
  fallback?: Locale;
}): Locale => {
  if (isBrowser()) {
    const htmlLang = document.documentElement.lang as Locale;
    if (locales.includes(htmlLang)) return htmlLang;
  }

  const navigatorLanguage = navigator.language.split("-").at(0) as Locale;
  if (locales.includes(navigatorLanguage)) return navigatorLanguage;

  return options?.fallback || "en";
};

/**
 * The I18n store.
 */
export const store: {
  /**
   * The currently active locale.
   */
  locale: Locale;

  /**
   * Translations currently loaded in the store.
   */
  dictionary: TranslationDictionary;
} = {
  locale: setLocale(),
  dictionary: locales.reduce(
    (acc, v) => Object.assign(acc, { [v]: {} }),
    {} as TranslationDictionary,
  ),
};

/**
 * Load the translations for all supported locales in the store.
 *
 * @param translations the translations to load as a `TranslationDictionary`
 * @param override whether the `translations` should replace the ones already loaded
 */
export const loadTranslations = (translations: TranslationDictionary, override?: boolean) => {
  for (const locale of locales) {
    if (override) {
      store.dictionary[locale] = translations[locale];
    } else {
      store.dictionary[locale] = merge(store.dictionary[locale], translations[locale]);
    }
  }
};

/**
 * Translate the given `key` for the currently active locale (or the given `locale` in `options`).
 *
 * @param key the translation key
 * @param options the translate options
 * @returns the translation if found or a translation missing message
 */
export const translate = (
  key: string,
  options?: {
    /**
     * The values of the translation's placeholders (variables).
     */
    vars?: Record<string, string>;

    /**
     * The maximum length of the translation (it will be truncated if necessary).
     */
    maxLength?: number;

    /**
     * Force a specific locale to be used instead of the currently active one.
     */
    locale?: Locale;
  },
) => {
  const identifiers = key.split(".");
  const vars = options?.vars;
  const maxLength = options?.maxLength;
  const locale = options?.locale ?? store.locale;
  const localeDictionary = store.dictionary[locale];

  let value: TranslationKeys | string | undefined;

  for (const [idx, identifier] of identifiers.entries()) {
    if (idx === 0) {
      value = localeDictionary[identifier];
    } else {
      if (value !== undefined && typeof value !== "string") {
        value = value[identifier];
      }
    }

    if (value === undefined) break;

    if (typeof value === "string") {
      if (idx + 1 < identifiers.length) break;
      let result = value as string;

      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          result = result.replaceAll(new RegExp(`\\{{2}\\s*${k}\\s*\\}{2}`, "g"), v);
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
