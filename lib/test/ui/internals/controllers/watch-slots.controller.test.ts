import { fixture, fixtureCleanup } from "@open-wc/testing";
import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { beforeAll, describe, expect, it } from "vitest";
import { NhElement } from "../../../../src/ui/components";
import { updateWhenSlotsChange, watchSlots } from "../../../../src/ui/internals/controllers";

/**
 * Web component with slots being watched by calling the `updateWhenSlotsChange` function in the
 * constructor. This can be used in TypeScript or JavaScript.
 */
class FunctionSlotsWatched extends NhElement {
  constructor() {
    super();
    updateWhenSlotsChange(this, "[default]", "prefix", "suffix");
  }

  protected override render() {
    return html`
      <div>
        <p>Some text</p>
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }
}

customElements.define("function-slots-watched", FunctionSlotsWatched);

/**
 * Web component with slots being watched by using the `watchSlots` decorator above the class
 * definition. Decorators can only be used in TypeScript.
 */
@customElement("decorator-slots-watched")
@watchSlots("[default]", "prefix", "suffix")
class DecoratorSlotsWatched extends NhElement {
  protected override render() {
    return html`
      <div>
        <p>Some text</p>
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }
}

// Function component with watched slots
let functionSlotsWatched: NhElement;
let functionWatchSlotsController: typeof functionSlotsWatched.watchSlotsController;

// Decorator component with watched slots
let decoratorSlotsWatched: NhElement;
let decoratorWatchSlotsController: typeof decoratorSlotsWatched.watchSlotsController;

describe.concurrent("[lib] ui/internals/controllers/watch-slots", () => {
  beforeAll(async () => {
    functionSlotsWatched = await fixture<NhElement>(html`
      <function-slots-watched>
        <span slot="prefix">Function <strong>prefix</strong></span>
        <p>Function <span>default</span> slot</p>
      </function-slots-watched>
    `);

    decoratorSlotsWatched = await fixture<NhElement>(html`
      <decorator-slots-watched>
        <p>Decorator <span>default</span> slot</p>
        <span slot="suffix">Decorator <strong>suffix</strong></span>
      </decorator-slots-watched>
    `);

    functionWatchSlotsController = functionSlotsWatched.watchSlotsController;
    decoratorWatchSlotsController = decoratorSlotsWatched.watchSlotsController;
  });

  it("should be able to know if a slot is used or not", () => {
    expect(functionWatchSlotsController!.hasSlot("prefix")).toBe(true);
    expect(functionWatchSlotsController!.hasSlot("[default]")).toBe(true);
    expect(functionWatchSlotsController!.hasSlot("suffix")).toBe(false);

    expect(decoratorWatchSlotsController!.hasSlot("prefix")).toBe(false);
    expect(decoratorWatchSlotsController!.hasSlot("[default]")).toBe(true);
    expect(decoratorWatchSlotsController!.hasSlot("suffix")).toBe(true);
  });

  it("should be able to get the text content of each slot", () => {
    expect(functionWatchSlotsController!.getTextContent("prefix")).toEqual("Function prefix");
    expect(functionWatchSlotsController!.getTextContent("[default]")).toEqual(
      "Function default slot",
    );
    expect(functionWatchSlotsController!.getTextContent("suffix")).toBeUndefined();

    expect(decoratorWatchSlotsController!.getTextContent("prefix")).toBeUndefined();
    expect(decoratorWatchSlotsController!.getTextContent("[default]")).toEqual(
      "Decorator default slot",
    );
    expect(decoratorWatchSlotsController!.getTextContent("suffix")).toEqual("Decorator suffix");
  });

  it("should be able to get the html content of each slot", () => {
    expect(functionWatchSlotsController!.getInnerHTML("prefix")).toContain(
      '<span slot="prefix">Function <strong>prefix</strong></span>',
    );
    expect(functionWatchSlotsController!.getInnerHTML("[default]")).toContain(
      "<p>Function <span>default</span> slot</p>",
    );
    expect(functionWatchSlotsController!.getInnerHTML("suffix")).toBeUndefined();

    expect(decoratorWatchSlotsController!.getInnerHTML("prefix")).toBeUndefined();
    expect(decoratorWatchSlotsController!.getInnerHTML("[default]")).toContain(
      "<p>Decorator <span>default</span> slot</p>",
    );
    expect(decoratorWatchSlotsController!.getInnerHTML("suffix")).toContain(
      '<span slot="suffix">Decorator <strong>suffix</strong></span>',
    );
  });

  it("should trigger a new render when a slot changes", async () => {
    // This line just allows for the `hostDisconnected` callback of the `watchSlots` controller to
    // be executed during the tests which improves the coverage report. There's no logic to test
    // in this callback anyway.
    fixtureCleanup();
  });
});
