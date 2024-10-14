import type { ReactiveController, ReactiveElement } from "lit";

/**
 * Requirements to be a host component of the slots controller.
 */
export type SlotsControllerHost = ReactiveElement & {
  /**
   * Slots controller.
   */
  slotsController: SlotsController;

  /**
   * Handler that will be called by the slots controller when a watched slot changed. The slots
   * controller already takes care of scheduling a new render of the host component.
   * @param name the name of the changed slot (`[default]` for the default slot)
   * @param slot the changed slot
   */
  slotChanged?: (name: string, slot: HTMLSlotElement) => void;
};

/**
 * Reactive controller that will automatically schedule a new render and notify the host component
 * when one of its watched slots changes. Additionally, this controller offers helper methods to
 * to easily work with the host component's slots regardless if they are watched or not.
 */
export class SlotsController implements ReactiveController {
  /**
   * Host component.
   */
  #host: SlotsControllerHost;

  /**
   * List of slot names to watch in the host component.
   */
  #slotNames: string[];

  /**
   * Initialize the slots reactive controller.
   * @param host the host component
   * @param slotNames the slot names to watch in the host component
   */
  constructor(host: SlotsControllerHost, ...slotNames: string[]) {
    this.#host = host;
    this.#slotNames = slotNames;
    this.#host.addController(this);
  }

  /**
   * Check if a slot is used in the host component.
   * @param slotName the name of the slot to check (use `[default]` for the default slot)
   * @returns `true` if the slot is used, `false` otherwise
   */
  hasSlot = (slotName: string) => {
    if (slotName === "[default]") {
      return [...this.#host.childNodes].some((node) => {
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

    return this.#host.querySelector(`:scope [slot="${slotName}"]`) !== null;
  };

  /**
   * Get all of the text nodes assigned to the requested slot.
   * @param slotName the name of the slot (use `[default]` for the default slot)
   * @returns the concatenated text as a string or `undefined` if no text content was found.
   */
  getTextContent = (slotName: string) => {
    const texts: string[] = [];

    if (slotName === "[default]") {
      for (const node of this.#host.childNodes) {
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
      const slot = this.#host.shadowRoot!.querySelector<HTMLSlotElement>(
        `slot[name="${slotName}"]`,
      );

      if (slot) {
        for (const node of slot.assignedNodes({ flatten: true })) {
          if (node.textContent && node.textContent.trim() !== "") {
            texts.push(node.textContent);
          }
        }
      }
    }

    const result = texts.map((item) => item.replace(/(\r\n|\n|\r)/gm, "").trim()).join(" ");
    return result === "" ? undefined : result;
  };

  /**
   * Get all of the HTML from the nodes assigned to the requested slot.
   * @param slotName the name of the slot (use `[default]` for the default slot)
   * @returns the concatenated html as a string or `undefined` if no content was found.
   */
  getInnerHTML = (slotName: string) => {
    const html: string[] = [];

    if (slotName === "[default]") {
      for (const node of this.#host.childNodes) {
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
      const slot = this.#host.shadowRoot!.querySelector<HTMLSlotElement>(
        `slot[name="${slotName}"]`,
      );

      if (slot) {
        for (const node of slot.assignedNodes({ flatten: true })) {
          html.push((node as Element).outerHTML);
        }
      }
    }

    const result = html.map((item) => item.replace(/(\r\n|\n|\r)/gm, "").trim()).join("");
    return result === "" ? undefined : result;
  };

  /**
   * Handler called when one of the host component's slots changes. If the slot is part of the
   * watched slots, a new render of the host component is scheduled and its `slotChanged` handler
   * is called if defined.
   * @param e the slot change event
   */
  #slotChangeHandler = (e: Event) => {
    const slot = e.target as HTMLSlotElement;

    if (
      (!slot.name && this.#slotNames.includes("[default]")) ||
      (slot.name && this.#slotNames.includes(slot.name))
    ) {
      this.#host.requestUpdate();

      if (this.#host.slotChanged) {
        this.#host.slotChanged(slot.name || "[default]", slot);
      }
    }
  };

  /**
   * Listen for slot changes in the host component's DOM if a list of slots to watch was given.
   */
  hostConnected() {
    if (this.#slotNames.length > 0) {
      this.#host.shadowRoot!.addEventListener("slotchange", this.#slotChangeHandler);
    }
  }

  /**
   * Remove the event listener from the host component when it disconnects from the controller.
   */
  hostDisconnected() {
    this.#host.shadowRoot!.removeEventListener("slotchange", this.#slotChangeHandler);
  }
}

/**
 * Attach the slots controller to a host component.
 * @param host the host component
 * @param slotNames the names of the slots to watch (use `[default]` for the default slot)
 */
export const attachSlotsController = (host: SlotsControllerHost, ...slotNames: string[]) =>
  new SlotsController(host, ...slotNames);
