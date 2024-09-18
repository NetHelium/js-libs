import { type PropertyValues, html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { NhElement } from "../";
import { type IconVariant, getIconPaths } from "../../icons/store";
import componentStyles from "../../styles/component.styles";
import styles from "./icon.styles";

/**
 * Display an icon that was previously loaded in the store.
 *
 * @event nh-error - Emitted when the requested icon does not exist in the store
 *
 * @csspart svg - The SVG element
 * @csspart path-{index} - Each path of the drawn icon (`path-0`, `path-1`, ...)
 */
@customElement("nh-icon")
export default class NhIcon extends NhElement {
  /**
   * Default styles.
   */
  static override styles = [componentStyles, styles];

  /**
   * Name of the icon to render.
   */
  @property({ type: String, reflect: true })
  name?: string;

  /**
   * Variant of the icon to render if applicable. If the icon only has one variant, it will be
   * loaded regardless of the value of this property.
   *
   * @default "outlined"
   */
  @property({ type: String, reflect: true })
  variant: IconVariant = "outlined";

  /**
   * Color of the icon. The special `currentColor` value means the icon will use the same color as
   * its parent.
   *
   * @default "currentColor"
   */
  @property({ type: String, reflect: true })
  color = "currentColor";

  /**
   * Paths to render inside the svg tag.
   */
  private _paths: string[] = [];

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("name") && this.name) {
      const paths = getIconPaths(this.name, this.variant);

      if (paths) {
        this._paths = paths;
      } else {
        this.emit("nh-error", {
          detail: {
            message: `Unable to find icon "${this.name}" in the store`,
          },
        });
      }
    }
  }

  protected override render() {
    if (!this.name || this._paths.length === 0) {
      return nothing;
    }

    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="${this.color}"
        part="svg"
        >
        ${this._paths.map(
          (path, idx) => svg`
          <path
            d="${path}"
            part="path-${idx}"
          ></path>
        `,
        )}
      </svg>
    `;
  }
}
