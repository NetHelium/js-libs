import { elementUpdated, fixture, fixtureCleanup } from "@open-wc/testing";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type SlotsControllerHost, attachSlotsController } from "../../../src/ui/controllers";

@customElement("slots-component")
class SlotsComponent extends LitElement implements SlotsControllerHost {
  slotsController = attachSlotsController(this, "[default]", "suffix");

  protected override render() {
    return html`
      <div id="container" class="${classMap({
        "has-prefix": this.slotsController.hasSlot("prefix"),
        "has-default": this.slotsController.hasSlot("[default]"),
        "has-suffix": this.slotsController.hasSlot("suffix"),
      })}">
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }
}

let slotsComponent: SlotsComponent;
let slotsController: typeof slotsComponent.slotsController;

const getContainerClasses = (component: HTMLElement) =>
  component.shadowRoot!.querySelector("#container")!.classList;

describe("[lib] ui/controllers/slots", () => {
  beforeEach(async () => {
    slotsComponent = await fixture(html`
      <slots-component>
        <span slot="suffix"><strong>Suffix</strong> content</span>
      </slots-component>
    `);

    slotsController = slotsComponent.slotsController;
  });

  it("should be able to know if a slot is used or not", async () => {
    expect(slotsController.hasSlot("prefix")).toBe(false);
    expect(slotsController.hasSlot("[default]")).toBe(false);
    expect(slotsController.hasSlot("suffix")).toBe(true);

    // Add prefix slot
    const prefixElement = document.createElement("span");
    prefixElement.innerHTML = "<strong>Prefix</strong> content";
    prefixElement.setAttribute("slot", "prefix");
    slotsComponent.appendChild(prefixElement);

    // Remove suffix slot
    slotsComponent.querySelector("[slot='suffix']")?.remove();

    // Wait for the component to update
    await elementUpdated(slotsComponent);

    expect(slotsController.hasSlot("prefix")).toBe(true);
    expect(slotsController.hasSlot("[default]")).toBe(false);
    expect(slotsController.hasSlot("suffix")).toBe(false);

    // Add a text node for the default slot
    const defaultTextNode = document.createTextNode("Default slot content");
    slotsComponent.appendChild(defaultTextNode);

    // Wait for the component to update
    await elementUpdated(slotsComponent);

    expect(slotsController.hasSlot("prefix")).toBe(true);
    expect(slotsController.hasSlot("[default]")).toBe(true);
    expect(slotsController.hasSlot("suffix")).toBe(false);
  });

  it("should get the text content of each slot", async () => {
    expect(slotsController.getTextContent("prefix")).toBeUndefined();
    expect(slotsController.getTextContent("[default]")).toBeUndefined();
    expect(slotsController.getTextContent("suffix")).toEqual("Suffix content");

    // Add prefix slot
    const prefixElement = document.createElement("span");
    prefixElement.innerHTML = "<strong>Prefix</strong> content";
    prefixElement.setAttribute("slot", "prefix");
    slotsComponent.appendChild(prefixElement);

    // Remove suffix slot
    slotsComponent.querySelector("[slot='suffix']")?.remove();

    // Wait for the components to update
    await elementUpdated(slotsComponent);

    expect(slotsController.getTextContent("prefix")).toEqual("Prefix content");
    expect(slotsController.getTextContent("[default]")).toBeUndefined();
    expect(slotsController.getTextContent("suffix")).toBeUndefined();

    // Add default slot
    const defaultElementNode = document.createElement("p");
    defaultElementNode.innerHTML = "<strong>Default slot</strong> content";
    slotsComponent.appendChild(defaultElementNode);

    // Wait for the components to update
    await elementUpdated(slotsComponent);

    expect(slotsController.getTextContent("prefix")).toEqual("Prefix content");
    expect(slotsController.getTextContent("[default]")).toEqual("Default slot content");
    expect(slotsController.getTextContent("suffix")).toBeUndefined();

    // Change default slot content to a text node
    defaultElementNode.remove();
    slotsComponent.appendChild(document.createTextNode("Text node for the default slot"));

    // Wait for the components to update
    await elementUpdated(slotsComponent);

    expect(slotsController.getTextContent("prefix")).toEqual("Prefix content");
    expect(slotsController.getTextContent("[default]")).toEqual("Text node for the default slot");
    expect(slotsController.getTextContent("suffix")).toBeUndefined();
  });

  it("should get the html content of each slot", async () => {
    expect(slotsController.getInnerHTML("prefix")).toBeUndefined();
    expect(slotsController.getInnerHTML("[default]")).toBeUndefined();
    expect(slotsController.getInnerHTML("suffix")).toEqual(
      '<span slot="suffix"><strong>Suffix</strong> content</span>',
    );

    // Add prefix slot
    const prefixElement = document.createElement("span");
    prefixElement.innerHTML = "<strong>Prefix</strong> content";
    prefixElement.setAttribute("slot", "prefix");
    slotsComponent.appendChild(prefixElement);

    // Remove suffix slot
    slotsComponent.querySelector("[slot='suffix']")?.remove();

    // Wait for the components to update
    await elementUpdated(slotsComponent);

    expect(slotsController.getInnerHTML("prefix")).toEqual(
      '<span slot="prefix"><strong>Prefix</strong> content</span>',
    );
    expect(slotsController.getInnerHTML("[default]")).toBeUndefined();
    expect(slotsController.getInnerHTML("suffix")).toBeUndefined();

    // Add default slot
    const defaultElementNode = document.createElement("p");
    defaultElementNode.innerHTML = "<strong>Default slot</strong> content";
    slotsComponent.appendChild(defaultElementNode);

    // Wait for the components to update
    await elementUpdated(slotsComponent);

    expect(slotsController.getInnerHTML("prefix")).toEqual(
      '<span slot="prefix"><strong>Prefix</strong> content</span>',
    );
    expect(slotsController.getInnerHTML("[default]")).toEqual(
      "<p><strong>Default slot</strong> content</p>",
    );
    expect(slotsController.getInnerHTML("suffix")).toBeUndefined();
  });

  it("should schedule a new render of the host component when a slot changes", async () => {
    expect(getContainerClasses(slotsComponent)).not.toContain("has-prefix");
    expect(getContainerClasses(slotsComponent)).not.toContain("has-default");
    expect(getContainerClasses(slotsComponent)).toContain("has-suffix");

    // Add prefix slot
    const prefixElement = document.createElement("span");
    prefixElement.innerHTML = "<strong>Prefix</strong> content";
    prefixElement.setAttribute("slot", "prefix");
    slotsComponent.appendChild(prefixElement);

    // Remove suffix slot
    slotsComponent.querySelector("[slot='suffix']")?.remove();

    // Wait for the components to update
    await elementUpdated(slotsComponent);

    expect(getContainerClasses(slotsComponent)).toContain("has-prefix");
    expect(getContainerClasses(slotsComponent)).not.toContain("has-default");
    expect(getContainerClasses(slotsComponent)).not.toContain("has-suffix");

    // Add default slot
    const defaultElementNode = document.createElement("p");
    defaultElementNode.innerHTML = "<strong>Default slot</strong> content";
    slotsComponent.appendChild(defaultElementNode);

    // Wait for the components to update
    await elementUpdated(slotsComponent);

    expect(getContainerClasses(slotsComponent)).toContain("has-prefix");
    expect(getContainerClasses(slotsComponent)).toContain("has-default");
    expect(getContainerClasses(slotsComponent)).not.toContain("has-suffix");
  });

  it("should call the `slotChanged` handler of the host component if defined", async () => {
    // Remove suffix slot
    slotsComponent.querySelector("[slot='suffix']")?.remove();

    // Add the `slotChanged` handler to the host component
    (slotsComponent as SlotsControllerHost).slotChanged = vi.fn();

    // Add prefix slot
    const prefixElement = document.createElement("span");
    prefixElement.innerHTML = "<strong>Prefix</strong> content";
    prefixElement.setAttribute("slot", "prefix");
    slotsComponent.appendChild(prefixElement);

    // Wait for the components to update
    await elementUpdated(slotsComponent);

    expect((slotsComponent as SlotsControllerHost).slotChanged).toHaveBeenCalledOnce();

    // Add default slot content
    slotsComponent.appendChild(document.createTextNode("Default slot content"));

    // Wait for the components to update
    await elementUpdated(slotsComponent);

    expect((slotsComponent as SlotsControllerHost).slotChanged).toHaveBeenCalledTimes(2);

    // This line just allows for the `hostDisconnected` callback of the `slots` controller to
    // be executed during the tests which improves the coverage report. There's no logic to test
    // in this callback anyway.
    fixtureCleanup();
  });
});
