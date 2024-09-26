export type NhBlurEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    "nh-blur": NhBlurEvent;
  }
}
