import "@shoelace-style/shoelace";
import type { Theme } from "./components/nh-header.js";
import "./components/nh-header.js";
import "./assets/styles.css";

const nhHeader = document.querySelector<HTMLElement>("nh-header");

if (nhHeader) {
  nhHeader.addEventListener("nh-theme-change", (e: CustomEvent<Theme>) => {
    const htmlElementClasses = document.documentElement.classList;

    if (e.detail === "dark") {
      htmlElementClasses.remove("sl-theme-light");
      htmlElementClasses.add("sl-theme-dark");
    } else {
      htmlElementClasses.remove("sl-theme-dark");
      htmlElementClasses.add("sl-theme-light");
    }
  });
}

declare global {
  interface HTMLElementEventMap {
    "nh-theme-change": CustomEvent;
  }
}
