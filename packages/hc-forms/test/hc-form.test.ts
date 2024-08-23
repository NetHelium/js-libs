import { getPrefixedParamsFromUrl } from "@net-helium/lib";
import { fixture, fixtureCleanup, html } from "@open-wc/testing";
import { describe, expect, it } from "vitest";
import "../src";

const formUrl =
  "https://helium-connect.fr/player/5b759aaa441eec5fb400002d/fid/66c5dcaab1ff63b9351bd3dc";

describe.concurrent("[hc-forms] hc-form", () => {
  /**
   * Get the encapsulated iframe inside the component.
   * @param component the component
   * @returns the iframe or `null` if not found or `undefined` if the component is not
   * finished loading
   */
  const getIframeFromComponent = (component: HTMLElement) =>
    component.shadowRoot?.querySelector("iframe");

  /**
   * Get the encapsulated error message inside the component.
   * @param component the component
   * @returns the error message or `null` if not found or `undefined` if the component is not
   * finished loading
   */
  const getErrorMsgFromComponent = (component: HTMLElement) =>
    component.shadowRoot?.querySelector("p");

  it("should render the error message for an invalid URL", async () => {
    const form = await fixture<HTMLElement>(html`<hc-form></hc-form>`);
    const errorMsg = getErrorMsgFromComponent(form)!;

    expect(getIframeFromComponent(form)).toBeFalsy();
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.textContent).toContain("failed to load");

    // This line just allows for the `disconnectedCallback` callback of the component to
    // be executed during the test which improves the coverage report. There's no logic to test
    // in this callback anyway.
    fixtureCleanup();
  });

  it("should render the iframe for a valid URL", async () => {
    const form = await fixture<HTMLElement>(html`<hc-form url=${formUrl}></hc-form>`);
    const iframe = getIframeFromComponent(form)!;

    expect(getErrorMsgFromComponent(form)).toBeFalsy();
    expect(iframe).toBeTruthy();
    expect(iframe.title).toContain("(66c5dcaab1ff63b9351bd3dc)");
  });

  it("should enrich the iframe URL with tracking data from the host page", async () => {
    // Creating some cookie preferences on the window which would be there if the cookies banner
    // of a landing page set them.
    window.cookies = {
      necessary: true,
      performance: true,
      social: false,
    };

    const form = await fixture<HTMLElement>(html`<hc-form url=${formUrl}></hc-form>`);
    const iframe = getIframeFromComponent(form)!;
    const urlParams = getPrefixedParamsFromUrl(iframe.src, "ldom", "ck-");

    // The URL should be enriched with the domain of the host page (localhost in the testing
    // environment).
    expect(urlParams.ldom).toContain("localhost");

    // The URL should also be enriched with the cookies data stored in the window
    expect(urlParams["ck-necessary"]).toEqual("1");
    expect(urlParams["ck-performance"]).toEqual("1");
    expect(urlParams["ck-social"]).toEqual("0");
    expect(urlParams["ck-other"]).toBeUndefined();
  });
});
