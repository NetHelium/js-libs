/**
 * Detect and transform deprecated syntax into the new and recommended web component syntax.
 */
const handleLegacySyntax = () => {
  const urlAttribute = "data-hc-url";
  const scrollOffsetAttribute = "data-hc-scroll-offset";

  for (const container of document.querySelectorAll(`[${urlAttribute}]`)) {
    const url = container.getAttribute(urlAttribute);
    const scrollOffset = container.getAttribute(scrollOffsetAttribute);

    const component = document.createElement("hc-form");

    if (url) {
      component.setAttribute("url", url);
    }

    if (scrollOffset) {
      component.setAttribute("scroll-offset", scrollOffset);
    }

    container.after(component);
    container.remove();
  }
};

// Handle deprecated syntax on a specific event
window.addEventListener("load-hc-forms", () => {
  handleLegacySyntax();
});

// Handle deprecated syntax on first load
handleLegacySyntax();
