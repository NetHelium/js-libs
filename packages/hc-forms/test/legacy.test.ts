import { describe, expect, it } from "vitest";
import "../src";

describe("[hc-forms] legacy", () => {
  it("should transform the deprecated syntax into the new web component syntax", () => {
    const legacyForm = document.createElement("div");

    legacyForm.setAttribute(
      "data-hc-url",
      "https://helium-connect.fr/player/5b759aaa441eec5fb400002d/fid/66c5dcaab1ff63b9351bd3dc",
    );

    legacyForm.setAttribute("data-hc-scroll-offset", "50");
    document.body.appendChild(legacyForm);

    let legacyFormSearch = document.querySelector("[data-hc-url]");
    let newFormSearch = document.querySelector("hc-form");

    expect(legacyFormSearch).not.toBeNull();
    expect(newFormSearch).toBeNull();

    dispatchEvent(new Event("load-hc-forms"));

    legacyFormSearch = document.querySelector("[data-hc-url]");
    newFormSearch = document.querySelector("hc-form");

    expect(legacyFormSearch).toBeNull();
    expect(newFormSearch).not.toBeNull();
  });
});
