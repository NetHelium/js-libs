// @vitest-environment jsdom

import { describe, expect, it } from "@net-helium/tools/test";
import { isBrowser } from "../../src/utils/environment.js";

describe("[lib] utils/environment (jsdom)", () => {
  it("should be considered a browser environment", () => {
    expect(isBrowser()).toBe(true);
  });
});
