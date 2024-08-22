import type { ReactiveControllerHost } from "lit";
import { updateWhenLocaleChanges } from "./localized-controller";

type ReactiveElementClass = {
  addInitializer(initializer: (element: ReactiveControllerHost) => void): void;

  // biome-ignore lint/suspicious/noExplicitAny:
  new (...args: any[]): ReactiveControllerHost;
};

type LocalizedDecorator = {
  (cls: ReactiveElementClass): void;
  (target: ReactiveElementClass, context: ClassDecoratorContext<ReactiveElementClass>): void;
};

/**
 * Decorator to localize a component.
 * @returns the altered class definition
 */
export const localized: () => LocalizedDecorator =
  (): LocalizedDecorator =>
  (clazz: ReactiveElementClass, _context?: ClassDecoratorContext<ReactiveElementClass>) => {
    clazz.addInitializer(updateWhenLocaleChanges);
    return clazz;
  };
