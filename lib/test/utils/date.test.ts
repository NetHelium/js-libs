import { describe, expect, it } from "@net-helium/tools/test";
import { isDate } from "../../src/utils/date.js";

describe("[lib] utils/date", () => {
  it("should detect if a value is a date object", () => {
    expect(isDate("Fri, 31 Jan 2025 00:00:00 GMT")).toBe(false);
    expect(isDate("2025-01-31")).toBe(false);
    expect(isDate(1738281600000)).toBe(false);
    expect(isDate(new Date(1738281600000))).toBe(true);
  });
});
