import { describe, expect, it } from "@net-helium/tools/test";
import { isBrowser } from "../../src/utils/environment.js";

describe("[lib] utils/environment (node)", () => {
  it("should not be considered a browser environment", () => {
    expect(isBrowser()).toBe(false);
  });
});
