import { describe, expect, it } from "@net-helium/tools/test";
import {
  getHostPathFromUrl,
  getMatchingParamsFromUrl,
  getUrlWithParams,
} from "../../src/utils/index.js";

describe.concurrent("[lib] utils/url", () => {
  it("should add the params to the url", () => {
    const url = "https://www.website.com/some-page?f=3&gid=123";

    const params = {
      gid: "132",
      utm_source: "google",
      utm_campaign: "newsletter",
    };

    expect(getUrlWithParams(url, params)).toEqual(
      "https://www.website.com/some-page?gid=123&utm_source=google&utm_campaign=newsletter&f=3",
    );

    expect(getUrlWithParams(url, params, { override: true })).toEqual(
      "https://www.website.com/some-page?f=3&gid=132&utm_source=google&utm_campaign=newsletter",
    );
  });

  it("should extract the host and the path from the url", () => {
    expect(getHostPathFromUrl("https://www.website.com/some-path/to-some-page?f=1&d=nh")).toEqual(
      "www.website.com/some-path/to-some-page",
    );

    expect(getHostPathFromUrl("www.website.com")).toBeUndefined();
    expect(getHostPathFromUrl("https://www.website.com")).toEqual("www.website.com");
    expect(getHostPathFromUrl("https://www.website.com?f=1&d=nh")).toEqual("www.website.com");
    expect(getHostPathFromUrl("https://www.website.com/")).toEqual("www.website.com");
    expect(getHostPathFromUrl("https://www.website.com/?f=1&d=nh")).toEqual("www.website.com");
  });

  it("should get the params matching the regexes", () => {
    const url =
      "https://www.website.com/some-page?hc_track=1&f=4&utm_source=google&utm_campaign=newsletter";

    expect(getMatchingParamsFromUrl(url, /^gid_/)).toEqual({});

    expect(getMatchingParamsFromUrl(url, /^hc_/, /^utm_/)).toEqual({
      hc_track: "1",
      utm_source: "google",
      utm_campaign: "newsletter",
    });
  });
});
