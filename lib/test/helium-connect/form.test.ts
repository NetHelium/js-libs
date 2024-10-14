import { describe, expect, it } from "vitest";
import { getHcFormIdFromUrl, getHcFormSlugFromUrl } from "../../src/helium-connect/index.js";

describe.concurrent("[lib] helium-connect/form", () => {
  const idUrl =
    "https://helium-connect.fr/player/5b759aaa441eec5fb400002d/fid/66c5dcaab1ff63b9351bd3dc?f=3&gid=123";

  const slugUrl =
    "https://helium-connect.fr/player/5b759aaa441eec5fb400002d/fpl/my-form-slug?f=3&gid=123";

  it("should extract the form id from the url", () => {
    expect(getHcFormIdFromUrl(slugUrl)).toBeUndefined();
    expect(getHcFormIdFromUrl(idUrl)).toEqual("66c5dcaab1ff63b9351bd3dc");
  });

  it("should extract the form slug from the url", () => {
    expect(getHcFormSlugFromUrl(idUrl)).toBeUndefined();
    expect(getHcFormSlugFromUrl(slugUrl)).toEqual("my-form-slug");
  });
});
