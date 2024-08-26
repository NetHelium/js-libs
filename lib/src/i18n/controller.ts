import type { ReactiveController, ReactiveControllerHost } from "lit";
import store, { setLocale } from "./store";

/**
 * Type representing the class of a component that can attach a reactive controller.
 */
type ReactiveElementClass = {
  addInitializer(initializer: (element: ReactiveControllerHost) => void): void;

  // biome-ignore lint/suspicious/noExplicitAny:
  new (...args: any[]): ReactiveControllerHost;
};

/**
 * Type representing the TypeScript decorator return value.
 */
type LocalizedDecorator = {
  (target: ReactiveElementClass): void;
  (target: ReactiveElementClass, context: ClassDecoratorContext<ReactiveElementClass>): void;
};

/**
 * Reactive controller that can be attached to any component that uses translations. This
 * controller will automatically schedule a new render of the component when the browser language
 * changes in order for the translations to update with the corresponding locale if supported.
 */
class LocalizedController implements ReactiveController {
  host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.host.addController(this);
  }

  languageChangeHandler = () => {
    store.locale = setLocale(store.locale);
    this.host.requestUpdate();
  };

  hostConnected() {
    window.addEventListener("languagechange", this.languageChangeHandler);
  }

  hostDisconnected() {
    window.removeEventListener("languagechange", this.languageChangeHandler);
  }
}

/**
 * Function to call in the constructor of a component in order to attach the `localized` reactive
 * controller. If using TypeScript, the `localized` decorator can also be used instead of this
 * function.
 * @param host The component to localize
 */
export const updateWhenLocaleChanges = (host: ReactiveControllerHost) => {
  host.addController(new LocalizedController(host));
};

/**
 * TypeScript decorator to attach a component to the `localized` reactive controller. If using
 * JavaScript, the `updateWhenLocaleChanges` function should be used instead (decorators are only
 * supported in TypeScript for now).
 */
export const localized =
  (): LocalizedDecorator =>
  (target: ReactiveElementClass, _context?: ClassDecoratorContext<ReactiveElementClass>) => {
    target.addInitializer(updateWhenLocaleChanges);
    return target;
  };
