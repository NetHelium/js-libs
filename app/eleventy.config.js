/**
 * 11ty configuration.
 * @param {import("@11ty/eleventy").UserConfig} config
 */
export default (config) => {
  // Make assets available for direct access in the development app
  config.addPassthroughCopy("public/css");
  config.addPassthroughCopy("public/js");

  // Liquid settings
  config.setLiquidOptions({});

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_layouts",
      output: "dist",
    },
  };
};
