import { css } from "lit";

/**
 * Default styles for all `nh-icon` components.
 */
export default css`
  :host {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    box-sizing: content-box !important;
  }
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
