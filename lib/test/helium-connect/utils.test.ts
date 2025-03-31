import { describe, expect, it } from "@net-helium/tools/test";
import { hcProcessPlaceholders } from "../../src/helium-connect/index.js";

describe.concurrent("[lib] helium-connect/utils", () => {
  it("should replace specific Helium Connect placeholders", () => {
    const str = "player/5b759aaa441eec5fb400002d/c/$CODE_CONTACT$/fid/66c5dcaab1ff63b9351bd3dc";
    const params: Record<string, string> = { hc_param: "1", utm_source: "google" };

    expect(hcProcessPlaceholders(str, params)).toEqual(str);
    params.hc_contact_code = "123456789";
    expect(hcProcessPlaceholders(str, params)).toEqual(
      "player/5b759aaa441eec5fb400002d/c/123456789/fid/66c5dcaab1ff63b9351bd3dc",
    );
  });
});
