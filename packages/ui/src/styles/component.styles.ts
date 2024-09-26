import { css } from "lit";

/**
 * Default global styles for all UI components.
 */
export default css`
  :host {
    box-sizing: border-box;
  }
  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }
`;
