import { css } from "lit";

/**
 * Default styles for all `nh-icon` components.
 */
export default css`
  :host {
    --color: inherit;
    --size: inherit;

    display: inline-block;
    width: var(--size);
    height: var(--size);
    color: var(--color);
  }
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
