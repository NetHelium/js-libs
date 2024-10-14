import { beforeEach, describe, expect, it } from "vitest";
import * as icons from "../../src/icons/index.js";

const { getIconPaths, loadIcon, loadIcons } = icons;

describe("[ui] icons/store", () => {
  beforeEach(() => {
    loadIcons(
      {
        x: icons.xIcon,
        "x-lg": icons.xLgIcon,
      },
      {
        override: true,
      },
    );
  });

  it("should load multiple additional icons in the store", () => {
    expect(getIconPaths("x")).not.toBeUndefined();
    expect(getIconPaths("x-lg")).not.toBeUndefined();
    expect(getIconPaths("x-circle", "outlined")).toBeUndefined();
    expect(getIconPaths("x-square", "filled")).toBeUndefined();

    loadIcons({
      "x-circle": icons.xCircleIcon,
      "x-square": icons.xSquareIcon,
    });

    expect(getIconPaths("x")).not.toBeUndefined();
    expect(getIconPaths("x-lg")).not.toBeUndefined();
    expect(getIconPaths("x-circle", "outlined")).not.toBeUndefined();
    expect(getIconPaths("x-square", "filled")).not.toBeUndefined();
  });

  it("should load multiple icons and override the store", () => {
    expect(getIconPaths("x")).not.toBeUndefined();
    expect(getIconPaths("x-lg")).not.toBeUndefined();
    expect(getIconPaths("x-circle", "outlined")).toBeUndefined();
    expect(getIconPaths("x-square", "filled")).toBeUndefined();

    loadIcons(
      {
        "x-circle": icons.xCircleIcon,
        "x-square": icons.xSquareIcon,
      },
      { override: true },
    );

    expect(getIconPaths("x")).toBeUndefined();
    expect(getIconPaths("x-lg")).toBeUndefined();
    expect(getIconPaths("x-circle", "outlined")).not.toBeUndefined();
    expect(getIconPaths("x-square", "filled")).not.toBeUndefined();
  });

  it("should load an additional icon in the store", () => {
    expect(getIconPaths("x")).not.toBeUndefined();
    expect(getIconPaths("x-lg")).not.toBeUndefined();
    expect(getIconPaths("x-circle", "outlined")).toBeUndefined();

    loadIcon("x-circle", icons.xCircleIcon);

    expect(getIconPaths("x")).not.toBeUndefined();
    expect(getIconPaths("x-lg")).not.toBeUndefined();
    expect(getIconPaths("x-circle", "outlined")).not.toBeUndefined();
  });

  it("should load an icon and override the store", () => {
    expect(getIconPaths("x")).not.toBeUndefined();
    expect(getIconPaths("x-lg")).not.toBeUndefined();
    expect(getIconPaths("x-circle", "outlined")).toBeUndefined();

    loadIcon("x-circle", icons.xCircleIcon, { override: true });

    expect(getIconPaths("x")).toBeUndefined();
    expect(getIconPaths("x-lg")).toBeUndefined();
    expect(getIconPaths("x-circle", "outlined")).not.toBeUndefined();
  });
});
