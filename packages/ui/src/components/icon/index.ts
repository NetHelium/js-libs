import NhIcon from "./icon.component.js";

export * from "./icon.component.js";
export default NhIcon;

declare global {
  interface HTMLElementTagNameMap {
    "nh-icon": NhIcon;
  }
}
