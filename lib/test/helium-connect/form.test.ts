import { describe, expect, it } from "vitest";
import { hcFormIdFromUrl, hcFormSlugFromUrl } from "../../src/helium-connect";

const idUrl =
  "https://helium-connect.fr/player/5b759aaa441eec5fb400002d/fid/66c5dcaab1ff63b9351bd3dc?f=3&gid=123";

const slugUrl =
  "https://helium-connect.fr/player/5b759aaa441eec5fb400002d/fpl/my-form-slug?f=3&gid=123";

describe.concurrent("[lib] helium-connect/form", () => {
  it("should extract the form id from the url", () => {
    expect(hcFormIdFromUrl(slugUrl)).toBeUndefined();
    expect(hcFormIdFromUrl(idUrl)).toEqual("66c5dcaab1ff63b9351bd3dc");
  });

  it("should extract the form slug from the url", () => {
    expect(hcFormSlugFromUrl(idUrl)).toBeUndefined();
    expect(hcFormSlugFromUrl(slugUrl)).toEqual("my-form-slug");
  });
});
