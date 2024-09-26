import { html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { type SlotsControllerHost, attachSlotsController } from "../../controllers/index.js";
import componentStyles from "../../styles/component.styles.js";
import { NhElement } from "../index.js";
import styles from "./button.styles.js";

/**
 * Button component to present an action to the user.
 *
 * @property {string} type - The button's type
 * @property {string|undefined} name - The button's name when used to submit a form
 * @property {string|undefined} value - The button's value when used to submit a form
 * @property {boolean} disabled - The button's disabled state
 * @property {string} variant - The button's variant
 * @property {string} size - The button's size
 * @property {boolean} pill - The button's pill-style rounded edges state
 *
 * @event nh-blur - Emitted when the button loses focus
 * @event nh-focus - Emitted when the button gains focus
 *
 * @slot [default] - The button's label
 * @slot prefix - An element displayed before the label
 * @slot suffix - An element displayed after the label
 *
 * @csspart base - The base wrapper of the component
 * @csspart prefix - The wrapper of the prefix
 * @csspart label - The wrapper of the label
 * @csspart suffix - The wrapper of the suffix
 */
@customElement("nh-button")
export default class NhButton extends NhElement implements SlotsControllerHost {
  /**
   * Default styles.
   */
  static override styles = [componentStyles, styles];

  /**
   * Button's type dictating its default behavior. The possible values are the same as with a
   * native button except for the default value which is `button` instead of `submit`.
   *
   * @default "button"
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#type
   */
  @property({ type: String, reflect: true })
  type: "button" | "reset" | "submit" = "button";

  /**
   * Button's name which is submitted as a pair with the button's `value` in the form data when the
   * button is used to submit a form.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#name
   */
  @property({ type: String, reflect: true })
  name?: string;

  /**
   * Button's value associated with the button's `name` when the button is used to submit a form.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#value
   */
  @property({ type: String, reflect: true })
  value?: string;

  /**
   * Wether or not the button is disabled.
   *
   * @default false
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Button's variant.
   *
   * @default "text"
   */
  @property({ type: String, reflect: true })
  variant: "text" | "outlined" | "filled" = "text";

  /**
   * Button's size.
   *
   * @default "medium"
   */
  @property({ type: String, reflect: true })
  size: "small" | "medium" | "large" = "medium";

  /**
   * Wether or not the button has pill-style rounded edges.
   *
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  pill = false;

  /**
   * Wether or not the button currently has the focus.
   */
  @state()
  private _hasFocus = false;

  /**
   * The underlying button HTML element.
   */
  @query("button")
  private _button!: HTMLButtonElement;

  /**
   * Slots controller to automatically schedule a new render when one of the specified slot changes.
   */
  slotsController = attachSlotsController(this, "[default]", "prefix", "suffix");

  /**
   * Remove focus from the button.
   */
  override blur() {
    this._button.blur();
  }

  /**
   * Set the focus on the button.
   * @param options the focus options
   */
  override focus(options?: FocusOptions) {
    this._button.focus(options);
  }

  /**
   * Simulate a click in the button.
   */
  override click() {
    this._button.click();
  }

  /**
   * Handler called when the button loses focus.
   */
  private _blurHandler = () => {
    this._hasFocus = false;
    this.emit("nh-blur");
  };

  /**
   * Handler called when the button gains focus.
   */
  private _focusHandler = () => {
    this._hasFocus = true;
    this.emit("nh-focus");
  };

  /**
   * Handler called when the button is clicked.
   */
  private _clickHandler = () => {
    if (this.type === "reset") {
      // Todo: Reset the form with a reactive controller
    }

    if (this.type === "submit") {
      // Todo: Submit the form with a reactive controller
    }
  };

  /**
   * Render the button.
   * @returns the button's DOM
   */
  protected override render() {
    return html`
      <button
        part="base"
        role="button"
        type="${this.type}"
        name="${ifDefined(this.name)}"
        value="${ifDefined(this.value)}"
        ?disabled="${this.disabled}"
        tabindex="${this.disabled ? "-1" : "0"}"
        aria-disabled="${this.disabled ? "true" : "false"}"
        class="${classMap({
          "button--disabled": this.disabled,
          "button--focused": this._hasFocus,
          "button--text": this.variant === "text",
          "button--outlined": this.variant === "outlined",
          "button--filled": this.variant === "filled",
          "button--small": this.size === "small",
          "button--medium": this.size === "medium",
          "button--large": this.size === "large",
          "button--pill": this.pill,
          "button--has-prefix": this.slotsController.hasSlot("prefix"),
          "button--has-label": this.slotsController.hasSlot("[default]"),
          "button--has-suffix": this.slotsController.hasSlot("suffix"),
        })}"
        @blur="${this._blurHandler}"
        @focus="${this._focusHandler}"
        @click="${this._clickHandler}"
      >
        <slot name="prefix" part="prefix" class="button--prefix"></slot>
        <slot part="label" class="button--label"></slot>
        <slot name="suffix" part="suffix" class="button--suffix"></slot>
      </button>
    `;
  }
}
