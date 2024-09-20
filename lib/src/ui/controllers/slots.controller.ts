import type { ReactiveController, ReactiveControllerHost, ReactiveElement } from "lit";

type SlotsControllerHost = ReactiveControllerHost &
  Element & {
    slotsController?: SlotsController;
  };

/**
 * Reactive controller that will automatically schedule a new render of the host component when
 * of the slots changes. Additionally, this controller adds the ability for the host component to
 * know if its slots are used and to get the current content (as HTML or text) of each slot.
 */
export class SlotsController implements ReactiveController {
  /**
   * Host component.
   */
  private _host: SlotsControllerHost;

  /**
   * List of slot names to track in the host component.
   */
  private _slotNames: string[];

  /**
   * Initialize the slot reactive controller.
   * @param host the host component
   * @param slotNames the slot names to track in the host component
   */
  constructor(host: SlotsControllerHost, ...slotNames: string[]) {
    this._host = host;
    this._host.addController(this);
    this._slotNames = slotNames;
  }

  /**
   * Check if the slot with the given `name` is used in the host component.
   * @param name the name of the slot to check (use `[default]` for the default slot)
   * @returns `true` if the slot is used, `false` otherwise
   */
  hasSlot = (name: string) => {
    if (name === "[default]") {
      return [...this._host.childNodes].some((node) => {
        if (node.nodeType === node.TEXT_NODE && node.textContent!.trim() !== "") {
          return true;
        }

        if (node.nodeType === node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          if (!element.hasAttribute("slot")) {
            return true;
          }
        }

        return false;
      });
    }

    return this._host.querySelector(`:scope [slot="${name}"]`) !== null;
  };

  /**
   * Get all of the text nodes assigned to the requested slot.
   * @param name the name of the slot (use `[default]` for the default slot)
   * @returns the concatenated text as a string or `undefined` if no text content was found.
   */
  getTextContent = (name: string) => {
    const texts: string[] = [];

    if (name === "[default]") {
      for (const node of this._host.childNodes) {
        if (
          node.nodeType === node.TEXT_NODE &&
          node.textContent &&
          node.textContent.trim() !== ""
        ) {
          texts.push(node.textContent.trim());
        }

        if (node.nodeType === node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          if (!element.hasAttribute("slot") && node.textContent && node.textContent.trim() !== "") {
            texts.push(node.textContent);
          }
        }
      }
    } else {
      const slot = this._host.shadowRoot!.querySelector<HTMLSlotElement>(`slot[name="${name}"]`);

      if (slot) {
        for (const node of slot.assignedNodes({ flatten: true })) {
          if (node.textContent && node.textContent.trim() !== "") {
            texts.push(node.textContent);
          }
        }
      }
    }

    if (texts.length === 0) return;
    return texts.join(" ");
  };

  /**
   * Get all of the HTML from the nodes assigned to the requested slot.
   * @param name the name of the slot (use `[default]` for the default slot)
   * @returns the concatenated html as a string or `undefined` if no content was found.
   */
  getInnerHTML = (name: string) => {
    const html: string[] = [];

    if (name === "[default]") {
      for (const node of this._host.childNodes) {
        if (node.nodeType === node.TEXT_NODE && node.textContent) {
          html.push(node.textContent);
        }

        if (node.nodeType === node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          if (!element.hasAttribute("slot")) {
            html.push(element.outerHTML);
          }
        }
      }
    } else {
      const slot = this._host.shadowRoot!.querySelector<HTMLSlotElement>(`slot[name="${name}"]`);

      if (slot) {
        for (const node of slot.assignedNodes({ flatten: true })) {
          if (
            node.nodeType === Node.TEXT_NODE &&
            node.textContent &&
            node.textContent.trim() !== ""
          ) {
            html.push(node.textContent.trim());
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            html.push((node as HTMLElement).outerHTML);
          }
        }
      }
    }

    if (html.length === 0) return;
    return html.join("");
  };

  /**
   * Handler called when a watched slot changes to schedule a new render of the host component.
   * @param e the slot change event
   */
  private _slotChangeHandler = (e: Event) => {
    const slot = e.target as HTMLSlotElement;

    if (
      (!slot.name && this._slotNames.includes("[default]")) ||
      (slot.name && this._slotNames.includes(slot.name))
    ) {
      this._host.requestUpdate();
    }
  };

  /**
   * Lifecycle handler called when the host component attaches the controller.
   */
  hostConnected() {
    this._host.shadowRoot!.addEventListener("slotchange", this._slotChangeHandler);
  }

  /**
   * Lifecycle handler called when the host component detaches the controller.
   */
  hostDisconnected() {
    this._host.shadowRoot!.removeEventListener("slotchange", this._slotChangeHandler);
  }
}

/**
 * Function to attach a component to the `Slots` reactive controller. If using TypeScript, the
 * `slots` decorator can also be used instead of this function.
 * @param host the component that needs its slots watched
 * @param slotNames the names of the slots to watch (use `[default]` for the default slot)
 */
export const addSlotsController = (host: SlotsControllerHost, ...slotNames: string[]) => {
  host.slotsController = new SlotsController(host, ...slotNames);
};

/**
 * Decorator to attach a component to the `Slots` reactive controller. If using JavaScript, the
 * `addSlotsController` function should be used instead (decorators are only supported in
 * TypeScript for now).
 * @param slotNames the names of the slots to watch (use `[default]` for the default slot)
 */
export const slots =
  (...slotNames: string[]) =>
  (target: typeof ReactiveElement) => {
    target.addInitializer((instance) => addSlotsController(instance, ...slotNames));
  };
