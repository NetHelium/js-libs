import { elementUpdated, fixture } from "@open-wc/testing";
import { html } from "lit";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type NhIcon from "../../src/components/icon/index.js";
import * as icons from "../../src/icons/index.js";
import "../../src/components/icon/index.js";

describe.concurrent("[ui] components/icon", () => {
  /**
   * Get the rendered SVG element inside the given component.
   * @param component the component
   * @returns the rendered SVG element in the component
   */
  const getRenderedSvg = (component: NhIcon) => component.shadowRoot!.querySelector("svg");

  /**
   * Get the SVG paths of the rendered SVG element inside the given component.
   * @param component the component
   * @returns the rendered SVG paths
   */
  const getRenderedPaths = (component: NhIcon) => {
    const svg = getRenderedSvg(component);
    if (!svg) return null;

    return [...svg.querySelectorAll("path")].map((path) => path.getAttribute("d")!);
  };

  let iconComponent: NhIcon;

  beforeAll(() => {
    const { loadIcons } = icons;

    loadIcons(
      {
        "x-circle": icons.xCircleIcon,
        "x-square": icons.xSquareIcon,
      },
      { override: true },
    );
  });

  it("should render nothing if the requested icon is not loaded", async () => {
    iconComponent = await fixture(html`<nh-icon name="x-circles"></nh-icon>`);
    expect(getRenderedSvg(iconComponent)).toBeNull();
  });

  it("should be able to render an icon", async () => {
    iconComponent = await fixture(html`<nh-icon name="x-circle"></nh-icon>`);
    expect(getRenderedSvg(iconComponent)).not.toBeNull();
    expect(getRenderedPaths(iconComponent)).toEqual(icons.xCircleIcon.outlined);

    iconComponent = await fixture(html`<nh-icon name="x-square" variant="filled"></nh-icon>`);
    expect(getRenderedSvg(iconComponent)).not.toBeNull();
    expect(getRenderedPaths(iconComponent)).toEqual(icons.xSquareIcon.filled);

    iconComponent.variant = "outlined";
    await elementUpdated(iconComponent);
    expect(getRenderedSvg(iconComponent)).not.toBeNull();
    expect(getRenderedPaths(iconComponent)).toEqual(icons.xSquareIcon.outlined);
  });

  it("should emit an nh-error event if the icon is invalid", async () => {
    const nhErrorHandlerMock = vi.fn();
    iconComponent = await fixture(html`<nh-icon name="x-circle"></nh-icon>`);

    // Add a listener for the `nh-error` event
    iconComponent.addEventListener("nh-error", nhErrorHandlerMock);

    // Change the icon to another valid one
    iconComponent.name = "x-square";
    await elementUpdated(iconComponent);
    expect(nhErrorHandlerMock).not.toHaveBeenCalled();

    // Change the icon to an invalid one
    iconComponent.name = "x-squares";
    await elementUpdated(iconComponent);
    expect(nhErrorHandlerMock).toHaveBeenCalled();
  });
});
