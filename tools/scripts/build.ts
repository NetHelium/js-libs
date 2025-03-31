#!/usr/bin/env -S pnpm tsx

/**
 * Build script for the custom tooling and the CLI.
 */

import arg from "arg";
import { type BuildOptions, build, context } from "esbuild";
import { globby } from "globby";
import { TscWatchClient } from "tsc-watch";
import { printError } from "../src/cli/messages";
import { getRootBinPath, streamCmd } from "../src/utils";

const args = arg({
  // Flags
  "--watch": Boolean,
  "--tsconfig": String,

  // Aliases
  "-w": "--watch",
  "-p": "--tsconfig",
});

const outdir = "dist";
streamCmd("rm", ["-rf", `./${outdir}`]);

const buildOptions: BuildOptions = {
  /**
   * Tell esbuild to create a bundle for each entry point by following the imports.
   */
  bundle: true,

  /**
   * Use the most up-to-date JavaScript features in the generated bundles. No issues will happen
   * as long as the node version used at runtime is recent enough (latest LTS is a safe bet).
   */
  target: "esnext",

  /**
   * Set `node` as the target platform which means that esbuild will ignore the imports of
   * built-in node modules when creating the bundles. The built-in modules will be imported at
   * runtime from the running node environment.
   */
  platform: "node",

  /**
   * Use the `ESM` module system in the generated bundles. Since `node` is set as the target
   * platform, esbuild would produce a `CJS` format by default instead of the now industry
   * standard `ESM` format (`CJS` was chosen as the default module system in node years before
   * `ESM` was fully implemented and chosen as the standard module system of the JavaScript
   * language).
   */
  format: "esm",

  /**
   * The entry points for each bundle to create.
   */
  entryPoints: [
    /**
     * The CLI.
     */
    "src/cli/index.ts",

    /**
     * Unit test utilities
     */
    "src/test/index.ts",
    "src/test/dom.ts",
    "src/test/vitest-setup.ts",

    /**
     * E2E test utilities
     */
    "src/e2e/index.ts",
    "src/e2e/fixtures/index.ts",

    /**
     * Unit and E2E test configurations
     */
    ...(await globby("src/(e2e|test)/configs/*.ts")),

    /**
     * Other utilities.
     */
    "src/utils/index.ts",
  ],

  /**
   * The directory in which the JavaScript bundles are to be generated.
   */
  outdir,

  /**
   * Ignore the imports of external packages, they will be imported at runtime like the built-in
   * node modules.
   */
  packages: "external",

  /**
   * Log the build result in the console.
   */
  logLevel: "info",
};

const tscArgs = ["-p", args["--tsconfig"] || "tsconfig.json"];

if (args["--watch"]) {
  // Build the type definitions in watch mode
  new TscWatchClient().start(...tscArgs);

  // Build the JavaScript bundles in watch mode
  (await context(buildOptions)).watch();
} else {
  const tsc = await getRootBinPath("tsc");

  if (!tsc) {
    const errorMessages = [
      "The TypeScript compiler (tsc) could not be found!",
      "Make sure typescript is installed in the root project.",
    ];

    await printError(errorMessages.join("\n"));
    process.exit(1);
  }

  // Build the type definitions
  streamCmd(tsc, tscArgs);

  // Build the JavaScript bundles
  await build(buildOptions);
}
