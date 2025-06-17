// @vitest-environment jsdom

import { describe, expect, it } from "@net-helium/tools/test";
import { parseCookie, serializeCookie } from "../../src/utils/cookie.js";

describe("[lib] utils/cookie (jsdom)", () => {
  const cookieName = "test-cookie";
  const cookieValue = "test-value";
  let cookieString: string;

  it("should disable httpOnly by force when using client side JavaScript", () => {
    cookieString = serializeCookie(cookieName, cookieValue, { httpOnly: true });
    expect(cookieString).not.toContain("HttpOnly");
  });

  it("should serialize data as a cookie string", () => {
    cookieString = serializeCookie(cookieName, cookieValue, { encoding: "base64" });
    expect(cookieString).toContain(`${cookieName}=dGVzdC12YWx1ZQ==`);
    expect(cookieString).toContain("Path=/");
    expect(cookieString).toContain("SameSite=Lax");
  });

  it("should parse a cookie string", () => {
    const cookieData = parseCookie(cookieString, "base64");
    expect(cookieData.domain).toBeUndefined();
    expect(cookieData.expires).toBeUndefined();
    expect(cookieData.maxAge).toBeUndefined();

    expect(cookieData).toEqual({
      name: cookieName,
      value: cookieValue,
      encoding: "base64",
      path: "/",
      sameSite: "lax",
    });
  });
});
