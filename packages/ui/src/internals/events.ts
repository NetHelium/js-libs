/**
 * Match event that requires a detail object.
 */
export type EventWithRequiredDetail<T> = T extends keyof GlobalEventHandlersEventMap
  ? GlobalEventHandlersEventMap[T] extends CustomEvent<Record<PropertyKey, unknown>>
    ? GlobalEventHandlersEventMap[T] extends CustomEvent<Record<PropertyKey, never>>
      ? never
      : Partial<
            GlobalEventHandlersEventMap[T]["detail"]
          > extends GlobalEventHandlersEventMap[T]["detail"]
        ? never
        : T
    : never
  : never;

/**
 * Match event that does not require a detail object.
 */
export type EventWithoutRequiredDetail<T> = T extends keyof GlobalEventHandlersEventMap
  ? GlobalEventHandlersEventMap[T] extends CustomEvent<Record<PropertyKey, unknown>>
    ? GlobalEventHandlersEventMap[T] extends CustomEvent<Record<PropertyKey, never>>
      ? T
      : Partial<
            GlobalEventHandlersEventMap[T]["detail"]
          > extends GlobalEventHandlersEventMap[T]["detail"]
        ? T
        : never
    : T
  : T;

/**
 * List of events that require a detail object.
 */
export type EventsWithRequiredDetail = {
  [E in keyof GlobalEventHandlersEventMap as EventWithRequiredDetail<E>]: true;
};

/**
 * List of events that do not require a detail object.
 */
export type EventsWithoutRequiredDetail = {
  [E in keyof GlobalEventHandlersEventMap as EventWithoutRequiredDetail<E>]: true;
};

/**
 * Make a property of an object required.
 */
type WithRequired<T, K extends keyof T> = T & { [prop in K]-?: T[prop] };

/**
 * Get the proper type for the options of an event that is more precise and restrictive than the
 * regular `CustomEventInit` when appropriate.
 */
export type NhEventInit<T> = T extends keyof GlobalEventHandlersEventMap
  ? GlobalEventHandlersEventMap[T] extends CustomEvent<Record<PropertyKey, unknown>>
    ? GlobalEventHandlersEventMap[T] extends CustomEvent<Record<PropertyKey, never>>
      ? CustomEventInit<GlobalEventHandlersEventMap[T]["detail"]>
      : Partial<
            GlobalEventHandlersEventMap[T]["detail"]
          > extends GlobalEventHandlersEventMap[T]["detail"]
        ? CustomEventInit<GlobalEventHandlersEventMap[T]["detail"]>
        : WithRequired<CustomEventInit<GlobalEventHandlersEventMap[T]["detail"]>, "detail">
    : CustomEventInit
  : CustomEventInit;

/**
 * Get the event type based on its name.
 */
export type CustomEventType<T> = T extends keyof GlobalEventHandlersEventMap
  ? GlobalEventHandlersEventMap[T] extends CustomEvent<unknown>
    ? GlobalEventHandlersEventMap[T]
    : CustomEvent<unknown>
  : CustomEvent<unknown>;
