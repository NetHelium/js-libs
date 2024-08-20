import "@shoelace-style/shoelace";
import "$assets/styles.css";
import "$components/nh-layout";
import type { Theme } from "$components/nh-header";

const nhLayout = document.querySelector<HTMLElement>("nh-layout");

if (nhLayout) {
  // Apply the requested theme.
  nhLayout.addEventListener("nh-theme-change", (e: CustomEvent<Theme>) => {
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
