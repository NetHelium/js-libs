import "@shoelace-style/shoelace";
import "$assets/styles.css";
import "$components/nh-layout";

declare global {
  interface HTMLElementEventMap {
    "nh-theme-change": CustomEvent;
  }
}
