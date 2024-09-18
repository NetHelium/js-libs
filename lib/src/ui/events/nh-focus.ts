export type NhFocusEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    "nh-focus": NhFocusEvent;
  }
}
