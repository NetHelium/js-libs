#!/usr/bin/env -S pnpm tsx

/**
 * Build script for the CLI.
 */

import { build } from "esbuild";

await build({
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
   * The entry point of the CLI source code.
   */
  entryPoints: ["src/cli/index.ts"],

  /**
   * Path and name of the bundled node executable.
   */
  outfile: "bin/nhcli",

  /**
   * Ignore the imports of external packages, they will be imported at runtime like the built-in
   * node modules.
   */
  packages: "external",
});
