import { describe, expect, it } from "vitest";
import { addParamsToUrl, getHostPathFromUrl, getPrefixedParamsFromUrl } from "../src";

describe.concurrent("[lib] url", () => {
  it("should extract the host and the path from the url", () => {
    expect(getHostPathFromUrl("https://www.website.com/some-path/to-some-page?f=1&d=nh")).toEqual(
      "www.website.com/some-path/to-some-page",
    );

    expect(getHostPathFromUrl("https://www.website.com")).toEqual("www.website.com");
    expect(getHostPathFromUrl("https://www.website.com?f=1&d=nh")).toEqual("www.website.com");
    expect(getHostPathFromUrl("https://www.website.com/")).toEqual("www.website.com");
    expect(getHostPathFromUrl("https://www.website.com/?f=1&d=nh")).toEqual("www.website.com");
  });

  it("should return the requested params from the url", () => {
    const url =
      "https://www.website.com/some-page?f=3&hc_track=1&utm_source=google&gd=rel&utm_campaign=newsletter";

    const expected = {
      hc_track: "1",
      utm_source: "google",
      utm_campaign: "newsletter",
    };

    expect(getPrefixedParamsFromUrl(url, "hc_", "utm_")).toEqual(expected);
    expect(getPrefixedParamsFromUrl(url, "gid_")).toEqual({});
  });

  it("should add the params to the url", () => {
    const url = "https://www.website.com/some-page?f=3&gid=123";

    const params = {
      gid: "132",
      utm_source: "google",
      utm_campaign: "newsletter",
    };

    const expectedWithoutOverride =
      "https://www.website.com/some-page?gid=123&utm_source=google&utm_campaign=newsletter&f=3";

    const expectedWithOverride =
      "https://www.website.com/some-page?f=3&gid=132&utm_source=google&utm_campaign=newsletter";

    expect(addParamsToUrl(url, params, false)).toEqual(expectedWithoutOverride);
    expect(addParamsToUrl(url, params)).toEqual(expectedWithOverride);
  });
});
