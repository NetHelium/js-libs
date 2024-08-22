import type { ReactiveController, ReactiveControllerHost } from "lit";
import store, { setLocale } from "./store";

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

  hostConnected(): void {
    window.addEventListener("languagechange", this.languageChangeHandler);
  }

  hostDisconnected(): void {
    window.removeEventListener("languagechange", this.languageChangeHandler);
  }
}

export const updateWhenLocaleChanges = (host: ReactiveControllerHost) =>
  host.addController(new LocalizedController(host));
