import type { ReactiveController, ReactiveControllerHost, ReactiveElement } from "lit";
import store, { setLocale } from "./store";

/**
 * Reactive controller that can be attached to any component that uses translations. This
 * controller will automatically schedule a new render of the component when the browser language
 * changes in order for the translations to update with the corresponding locale if supported.
 */
class LocalizedController implements ReactiveController {
  /**
   * Host component.
   */
  private _host: ReactiveControllerHost;

  /**
   * Initialize the localize reactive controller.
   * @param host the host component
   */
  constructor(host: ReactiveControllerHost) {
    this._host = host;
    this._host.addController(this);
  }

  /**
   * Handler called when the browser language changes.
   */
  private _languageChangeHandler = () => {
    store.locale = setLocale(store.locale);
    this._host.requestUpdate();
  };

  /**
   * Lifecycle handler called when the host component attaches to the controller.
   */
  hostConnected() {
    window.addEventListener("languagechange", this._languageChangeHandler);
  }

  /**
   * Lifecycle handler called when the host component detaches from the controller.
   */
  hostDisconnected() {
    window.removeEventListener("languagechange", this._languageChangeHandler);
  }
}

/**
 * Function to attach a component to the `localized` reactive controller. If using TypeScript,
 * the `localized` decorator can also be used instead of this function.
 * @param host the component to localize
 */
export const addLocalizedController = (host: ReactiveControllerHost) => {
  host.addController(new LocalizedController(host));
};

/**
 * Decorator to attach a component to the `Localized` reactive controller. If using JavaScript, the
 * `addLocalizedController` function should be used instead (decorators are only supported in
 * TypeScript for now).
 */
export const localized = () => (target: typeof ReactiveElement) => {
  target.addInitializer(addLocalizedController);
};
