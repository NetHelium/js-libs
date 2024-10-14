import { setLocale, store } from "@net-helium/lib/i18n";
import type { ReactiveController, ReactiveControllerHost, ReactiveElement } from "lit";

/**
 * Reactive controller that can be attached to any component that uses translations. This
 * controller will automatically schedule a new render of the component when the browser language
 * changes in order for the translations to update with the corresponding locale if supported.
 */
class LocalizedController implements ReactiveController {
  /**
   * Host component.
   */
  #host: ReactiveControllerHost;

  /**
   * Initialize the localize reactive controller.
   * @param host the host component
   */
  constructor(host: ReactiveControllerHost) {
    this.#host = host;
  }

  /**
   * Update the current locale in the store with the browser's language if supported (fallback on
   * the previously used locale otherwise) and schedule a new render of the component.
   */
  #languageChangeHandler = () => {
    store.locale = setLocale({ fallback: store.locale });
    this.#host.requestUpdate();
  };

  /**
   * Listen for a change of the browser's language.
   */
  hostConnected() {
    addEventListener("languagechange", this.#languageChangeHandler);
  }

  /**
   * Remove the event listener when the host component disconnects from the controller.
   */
  hostDisconnected() {
    removeEventListener("languagechange", this.#languageChangeHandler);
  }
}

/**
 * Function to attach a component to the `localized` reactive controller. If using TypeScript,
 * the `localized` decorator can also be used instead of this function.
 * @param host the component to localize
 */
export const attachLocalizedController = (host: ReactiveControllerHost) => {
  host.addController(new LocalizedController(host));
};

/**
 * Decorator to attach a component to the `Localized` reactive controller. If using JavaScript, the
 * `attachLocalizedController` function should be used instead (decorators are only supported in
 * TypeScript for now).
 * @param target the class of the component to localize
 */
export const localized = () => (target: typeof ReactiveElement) => {
  target.addInitializer(attachLocalizedController);
};
