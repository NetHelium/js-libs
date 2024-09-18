export type NhErrorEvent = CustomEvent<{ message?: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    "nh-error": NhErrorEvent;
  }
}
