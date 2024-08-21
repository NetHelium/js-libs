/**
 * Detect and transform deprecated syntax into the new and recommended web component syntax.
 */
export default () => {
  const urlAttribute = "data-hc-url";
  const scrollOffsetAttribute = "data-hc-scroll-offset";

  for (const container of document.querySelectorAll(`[${urlAttribute}]`)) {
    const url = container.getAttribute(urlAttribute)!;
    const scrollOffset = container.getAttribute(scrollOffsetAttribute);

    const component = document.createElement("hc-form");
    component.setAttribute("url", url);

    if (scrollOffset) {
      component.setAttribute("scroll-offset", scrollOffset);
    }

    container.after(component);
    container.remove();
  }
};
