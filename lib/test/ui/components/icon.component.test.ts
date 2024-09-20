import { elementUpdated, fixture } from "@open-wc/testing";
import { html } from "lit";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type NhIcon from "../../../src/ui/components/icon";
import * as icons from "../../../src/ui/icons";
import "../../../src/ui/components/icon";

const { loadIcons } = icons;
let component: NhIcon;

const getRenderedSvg = (component: NhIcon) => component.shadowRoot!.querySelector("svg");

const getRenderedPaths = (component: NhIcon) => {
  const svg = getRenderedSvg(component);
  if (!svg) return null;

  return [...svg.querySelectorAll("path")].map((path) => path.getAttribute("d")!);
};

describe.concurrent("[lib] ui/components/icon", () => {
  beforeAll(() => {
    loadIcons(
      {
        "x-circle": icons.xCircleIcon,
        "x-square": icons.xSquareIcon,
      },
      { override: true },
    );
  });

  it("should render nothing if the requested icon is not loaded", async () => {
    component = await fixture(html`<nh-icon name="x-circles"></nh-icon>`);
    expect(getRenderedSvg(component)).toBeNull();
  });

  it("should be able to render an icon", async () => {
    component = await fixture(html`<nh-icon name="x-circle"></nh-icon>`);
    expect(getRenderedSvg(component)).not.toBeNull();
    expect(getRenderedPaths(component)).toEqual(icons.xCircleIcon.outlined);

    component = await fixture(html`<nh-icon name="x-square" variant="filled"></nh-icon>`);
    expect(getRenderedSvg(component)).not.toBeNull();
    expect(getRenderedPaths(component)).toEqual(icons.xSquareIcon.filled);
  });

  it("should emit an nh-error event if the icon is invalid", async () => {
    const nhErrorHandlerMock = vi.fn();
    component = await fixture(html`<nh-icon name="x-circle"></nh-icon>`);

    // Add a listener for the `nh-error` event
    component.addEventListener("nh-error", nhErrorHandlerMock);

    // Change the icon to another valid one
    component.name = "x-square";
    await elementUpdated(component);
    expect(nhErrorHandlerMock).not.toHaveBeenCalled();

    // Change the icon to an invalid one
    component.name = "x-squares";
    await elementUpdated(component);
    expect(nhErrorHandlerMock).toHaveBeenCalled();
  });
});
