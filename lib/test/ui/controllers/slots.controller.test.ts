import { elementUpdated, fixture, fixtureCleanup } from "@open-wc/testing";
import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { beforeAll, describe, expect, it } from "vitest";
import { NhElement } from "../../../src/ui/components";
import { addSlotsController, slots } from "../../../src/ui/controllers";

/**
 * Function based controller attachment (JavaScript or TypeScript)
 */
class FunctionSlotsComponent extends NhElement {
  constructor() {
    super();
    addSlotsController(this, "[default]", "prefix", "suffix");
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

customElements.define("function-slots-component", FunctionSlotsComponent);

/**
 * Decorator based controller attachment (TypeScript only)
 */
@customElement("decorator-slots-component")
@slots("[default]", "prefix", "suffix")
class DecoratorSlotsComponent extends NhElement {
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

// Function component
let functionSlotsComponent: NhElement;
let functionSlotsController: typeof functionSlotsComponent.slotsController;

// Decorator component
let decoratorSlotsComponent: NhElement;
let decoratorSlotsController: typeof decoratorSlotsComponent.slotsController;

describe("[lib] ui/internals/controllers/watch-slots", () => {
  beforeAll(async () => {
    functionSlotsComponent = await fixture<NhElement>(html`
      <function-slots-component>
        <span slot="prefix">Function <strong>prefix</strong></span>
        <p>Function <span>default</span> slot</p>
        Text node in default
      </function-slots-component>
    `);

    decoratorSlotsComponent = await fixture<NhElement>(html`
      <decorator-slots-component>
        Text node in default
        <p>Decorator <span>default</span> slot</p>
        <span slot="suffix">Decorator <strong>suffix</strong></span>
      </decorator-slots-component>
    `);

    functionSlotsController = functionSlotsComponent.slotsController;
    decoratorSlotsController = decoratorSlotsComponent.slotsController;
  });

  it("should be able to know if a slot is used or not", () => {
    expect(functionSlotsController!.hasSlot("prefix")).toBe(true);
    expect(functionSlotsController!.hasSlot("[default]")).toBe(true);
    expect(functionSlotsController!.hasSlot("suffix")).toBe(false);

    expect(decoratorSlotsController!.hasSlot("prefix")).toBe(false);
    expect(decoratorSlotsController!.hasSlot("[default]")).toBe(true);
    expect(decoratorSlotsController!.hasSlot("suffix")).toBe(true);
  });

  it("should be able to get the text content of each slot", () => {
    expect(functionSlotsController!.getTextContent("prefix")).toEqual("Function prefix");
    expect(functionSlotsController!.getTextContent("[default]")).toEqual(
      "Function default slot Text node in default",
    );
    expect(functionSlotsController!.getTextContent("suffix")).toBeUndefined();

    expect(decoratorSlotsController!.getTextContent("prefix")).toBeUndefined();
    expect(decoratorSlotsController!.getTextContent("[default]")).toEqual(
      "Text node in default Decorator default slot",
    );
    expect(decoratorSlotsController!.getTextContent("suffix")).toEqual("Decorator suffix");
  });

  it("should be able to get the html content of each slot", () => {
    expect(functionSlotsController!.getInnerHTML("prefix")).toContain(
      '<span slot="prefix">Function <strong>prefix</strong></span>',
    );
    expect(functionSlotsController!.getInnerHTML("[default]")).toContain(
      "<p>Function <span>default</span> slot</p>",
    );
    expect(functionSlotsController!.getInnerHTML("suffix")).toBeUndefined();

    expect(decoratorSlotsController!.getInnerHTML("prefix")).toBeUndefined();
    expect(decoratorSlotsController!.getInnerHTML("[default]")).toContain(
      "<p>Decorator <span>default</span> slot</p>",
    );
    expect(decoratorSlotsController!.getInnerHTML("suffix")).toContain(
      '<span slot="suffix">Decorator <strong>suffix</strong></span>',
    );
  });

  it("should trigger a new render when a slot changes", async () => {
    expect(functionSlotsController!.hasSlot("suffix")).toBe(false);
    expect(decoratorSlotsController!.hasSlot("prefix")).toBe(false);
    expect(functionSlotsController!.getTextContent("suffix")).toBeUndefined();
    expect(decoratorSlotsController!.getTextContent("prefix")).toBeUndefined();
    expect(functionSlotsController!.getInnerHTML("suffix")).toBeUndefined();
    expect(decoratorSlotsController!.getInnerHTML("prefix")).toBeUndefined();

    // Add suffix slot in the function based component
    const suffixHtml = "<p>Added suffix slot in the function component</p>";
    const functionComponentSuffix = document.createElement("p");
    functionComponentSuffix.innerHTML = suffixHtml;
    functionComponentSuffix.setAttribute("slot", "suffix");
    functionSlotsComponent.appendChild(functionComponentSuffix);
    const suffixText = functionComponentSuffix.textContent!.trim();

    // Add prefix slot in the decorator based component
    const prefixHtml = "<p>Added prefix for the decorator component</p>";
    const decoratorComponentPrefix = document.createElement("p");
    decoratorComponentPrefix.innerHTML = prefixHtml;
    decoratorComponentPrefix.setAttribute("slot", "prefix");
    decoratorSlotsComponent.appendChild(decoratorComponentPrefix);
    const prefixText = decoratorComponentPrefix.textContent!.trim();

    // Wait for the components to update
    await elementUpdated(functionSlotsComponent);
    await elementUpdated(decoratorSlotsComponent);

    expect(functionSlotsController!.hasSlot("suffix")).toBe(true);
    expect(decoratorSlotsController!.hasSlot("prefix")).toBe(true);
    expect(functionSlotsController!.getTextContent("suffix")).toContain(suffixText);
    expect(decoratorSlotsController!.getTextContent("prefix")).toContain(prefixText);
    expect(functionSlotsController!.getInnerHTML("suffix")).toContain(suffixHtml);
    expect(decoratorSlotsController!.getInnerHTML("prefix")).toContain(prefixHtml);

    // This line just allows for the `hostDisconnected` callback of the `slots` controller to
    // be executed during the tests which improves the coverage report. There's no logic to test
    // in this callback anyway.
    fixtureCleanup();
  });
});
