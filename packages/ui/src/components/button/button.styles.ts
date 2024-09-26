import { css } from "lit";

export default css`
  /* General styles */
  :host {
    display: inline-block;
    position: relative;
    width: auto;
    cursor: pointer;
  }
  button {
    display: inline-flex;
    justify-content: center;
    align-items: stretch;
    width: 100%;
    border-style: solid;
    border-width: var(--nh-input-border-width);
    cursor: inherit;
  }

  /* Text variant styles */
  .button--text {
    background-color: transparent;
    border-color: transparent;
  }
`;
