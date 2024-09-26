import NhButton from "./button.component.js";

export * from "./button.component.js";
export default NhButton;

declare global {
  interface HTMLElementTagNameMap {
    "nh-button": NhButton;
  }
}
