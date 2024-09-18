import { LitElement } from "lit";
import type {
  CustomEventType,
  EventWithRequiredDetail,
  EventWithoutRequiredDetail,
  EventsWithRequiredDetail,
  EventsWithoutRequiredDetail,
  NhEventInit,
} from "./events";
import "../events";

/**
 * Base class for UI related web components.
 */
export default abstract class NhElement extends LitElement {
  /**
   * Emit a custom event with convenient defaults.
   *
   * Standard event names like `click` are typed with a regular `CustomEventInit` while custom
   * events (prefixed by `nh-`) are typed with a more appropriate `CustomEventInit` that can
   * validate the data inside the detail object.
   *
   * @param name the name of the event
   * @param options the options for the event
   * @returns the dispatched event
   */
  protected emit<T extends string & keyof EventsWithRequiredDetail>(
    name: EventWithRequiredDetail<T>,
    options?: NhEventInit<T>,
  ): CustomEventType<T>;
  protected emit<T extends string & keyof EventsWithoutRequiredDetail>(
    name: EventWithoutRequiredDetail<T>,
    options?: NhEventInit<T>,
  ): CustomEventType<T>;
  protected emit<T extends string & keyof (EventsWithRequiredDetail | EventsWithoutRequiredDetail)>(
    name: T,
    options?: NhEventInit<T>,
  ): CustomEventType<T> {
    const event = new CustomEvent(name, {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {},
      ...options,
    });

    this.dispatchEvent(event);

    return event as CustomEventType<T>;
  }
}
