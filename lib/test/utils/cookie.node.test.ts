import { describe, expect, it } from "@net-helium/tools/test";
import { parseCookie, serializeCookie, serializeCookieData } from "../../src/utils/cookie.js";

describe("[lib] utils/cookie (node)", () => {
  let cookieString: string;
  const cookieName = "test-cookie";
  const simpleValue = "test-value";
  const date = new Date(Date.UTC(2025, 0, 31));
  const maxAge = 60 * 60 * 24; // One day

  const objectValue = {
    username: "user1",
    role: "admin",
  };

  it("should serialize the data as a cookie string without cookie options", () => {
    cookieString = serializeCookieData(simpleValue);
    expect(cookieString).toEqual("test-value");

    cookieString = serializeCookieData(simpleValue, { encoding: "base64" });
    expect(cookieString).toEqual("dGVzdC12YWx1ZQ==");

    cookieString = serializeCookieData(objectValue, { name: cookieName });
    expect(cookieString).toContain(`${cookieName}=json:`);
  });

  it("should serialize the data as a cookie string with cookie options", () => {
    cookieString = serializeCookie(cookieName, simpleValue);
    expect(cookieString).toContain(`${cookieName}=${simpleValue}`);
    expect(cookieString).toContain("Path=/");
    expect(cookieString).toContain("SameSite=Lax");

    cookieString = serializeCookie(cookieName, objectValue, {
      domain: "website.com",
      path: "/prefix",
      sameSite: "none",
      expires: date,
      encoding: "uriComponent",
    });

    expect(cookieString).toContain(`${cookieName}=json%3A`);
    expect(cookieString).toContain("Path=/prefix");
    expect(cookieString).toContain("SameSite=None");
    expect(cookieString).toContain("Secure");
    expect(cookieString).toContain("Expires=Fri, 31 Jan 2025 00:00:00 GMT");

    cookieString = serializeCookie(cookieName, simpleValue, {
      maxAge,
      expires: date,
      httpOnly: true,
      encoding: "base64",
    });

    expect(cookieString).toContain(`${cookieName}=dGVzdC12YWx1ZQ==`);
    expect(cookieString).toContain("HttpOnly");
    expect(cookieString).toContain("Max-Age=86400");
    expect(cookieString).not.toContain("Expires=");
  });

  it("should throw an error if some of the data is invalid when serializing", () => {
    expect(() => serializeCookie(";test", simpleValue)).toThrowError();
    expect(() => serializeCookie(cookieName, "test;value")).toThrowError();
    expect(() => serializeCookie(cookieName, simpleValue, { domain: "dom@in.com" })).toThrowError();
    expect(() => serializeCookie(cookieName, simpleValue, { path: "/path;" })).toThrowError();

    // maxAge has to be an integer
    expect(() => serializeCookie(cookieName, simpleValue, { maxAge: 45.23 })).toThrowError();

    // 8640000000000000 is the max possible timestamp so anything higher is an invalid date
    expect(() =>
      serializeCookie(cookieName, simpleValue, { expires: new Date(8640000000000001) }),
    ).toThrowError();
  });

  it("should parse a cookie string", () => {
    cookieString = serializeCookie(cookieName, simpleValue);
    let cookieData = parseCookie(cookieString);
    expect(cookieData.domain).toBeUndefined();
    expect(cookieData.expires).toBeUndefined();
    expect(cookieData.maxAge).toBeUndefined();

    expect(cookieData).toEqual({
      name: cookieName,
      value: simpleValue,
      encoding: false,
      path: "/",
      sameSite: "lax",
    });

    cookieString = serializeCookie(cookieName, objectValue, {
      domain: "website.com",
      path: "/prefix",
      sameSite: "none",
      expires: date,
      encoding: "uriComponent",
    });

    cookieData = parseCookie(cookieString, "uriComponent");
    expect(cookieData.maxAge).toBeUndefined();
    expect(cookieData.httpOnly).toBeUndefined();

    expect(cookieData).toEqual({
      domain: "website.com",
      path: "/prefix",
      sameSite: "none",
      secure: true,
      expires: date,
      encoding: "uriComponent",
      name: cookieName,
      value: objectValue,
    });

    cookieString = serializeCookie(cookieName, objectValue, {
      httpOnly: true,
      expires: date,
      sameSite: "strict",
      maxAge,
      encoding: "base64",
    });

    cookieData = parseCookie(cookieString, "base64");
    expect(cookieData.domain).toBeUndefined();
    expect(cookieData.expires).toBeUndefined();
    expect(cookieData.secure).toBeUndefined();

    expect(cookieData).toEqual({
      path: "/",
      httpOnly: true,
      encoding: "base64",
      maxAge,
      name: cookieName,
      value: objectValue,
      sameSite: "strict",
    });
  });
});
