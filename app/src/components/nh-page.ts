import { LitElement } from "lit";

/**
 * Metadata of a page.
 */
export type Metadata = {
  /**
   * The `title` of the page displayed in the menu.
   */
  title: string;

  /**
   * The `position` of the page in the menu.
   */
  position: number;
};

/**
 * Base class to define common logic for all page components.
 */
export default class NhPage extends LitElement {
  static metadata: Metadata;
}
