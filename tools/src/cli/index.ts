#!/usr/bin/env node

import type { ChildProcess } from "node:child_process";
import path from "node:path";
import arg from "arg";
import { build } from "esbuild";
import { type NhCliOptions, cmd, defineConfig, pathExists } from "../utils";
import {
  buildRunner,
  devRunner,
  e2eRunner,
  packRunner,
  storybookRunner,
  testRunner,
  tsCheckRunner,
} from "./runners";

const configFile = path.resolve(process.cwd(), "nhcli.config.ts");
let cliOptions: NhCliOptions;

/**
 * If the project has a configuration file (`nhcli.config.ts`) for the CLI, we transpile and load
 * it on the fly. Otherwise, we load the default configuration.
 */
if (await pathExists(configFile)) {
  const jsConfig = path.resolve(path.dirname(configFile), ".nh/nhcli.config.js");

  await build({
    entryPoints: [configFile],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: jsConfig,
  });

  cliOptions = await import(jsConfig).then(
    ({ default: config }: { default: NhCliOptions }) => config,
  );

  await cmd("rm", [jsConfig]);
} else {
  cliOptions = defineConfig();
}

/**
 * Command-line options of the CLI.
 */
const args = arg({
  // Flags
  "--cmd": String,
  "--config": String,
  "--coverage": Boolean,
  "--debug": Boolean,
  "--port": Number,
  "--restore": Boolean,
  "--rm": String,
  "--tsconfig": String,
  "--ui": Boolean,
  "--watch": Boolean,

  // Aliases
  "-c": "--config",
  "-p": "--port",
  "-r": "--restore",
  "-t": "--tsconfig",
  "-w": "--watch",
});

let childProcess: ChildProcess | undefined = undefined;

/**
 * TypeScript check runner.
 */
if (args._.includes("tscheck")) {
  const tsCheckProcess = await tsCheckRunner({
    tsconfig: args["--tsconfig"] || cliOptions.check.tsconfig,
  });

  if (tsCheckProcess) childProcess = tsCheckProcess;
}

/**
 * Development runner.
 */
if (args._.includes("dev")) {
  await devRunner();
}

/**
 * Storybook runner.
 */
if (args._.includes("storybook")) {
  await storybookRunner({
    cmd: args["--cmd"] || "dev",
    port: args["--port"] || 6006,
  });
}

/**
 * Unit tests runner.
 */
if (args._.includes("test")) {
  await testRunner({
    ...cliOptions.test,
    config: args["--config"] || cliOptions.test.config,
    ui: args["--ui"] || cliOptions.test.ui,
    watch: args["--watch"] || cliOptions.test.watch,
    codeCoverage: args["--coverage"] || cliOptions.test.codeCoverage,
  });
}

/**
 * E2E tests runner.
 */
if (args._.includes("e2e")) {
  const e2eProcess = await e2eRunner({
    config: args["--config"] || cliOptions.e2e.config,
    ui: args["--ui"] || cliOptions.e2e.ui,
  });

  if (e2eProcess) childProcess = e2eProcess;
}

/**
 * Build runner.
 */
if (args._.includes("build")) {
  const buildProcess = await buildRunner({
    ...cliOptions.build,
    tsconfig: args["--tsconfig"] || cliOptions.build.tsconfig,
    watch: args["--watch"] || cliOptions.build.watch,
  });

  if (buildProcess) childProcess = buildProcess;
}

/**
 * Pack runner to prepare publishing of a package.
 */
if (args._.includes("pack")) {
  await packRunner({
    cleanPackageJson:
      args["--rm"]?.split(",").map((v) => v.trim()) || cliOptions.pack.cleanPackageJson,
    restore: !!args["--restore"],
  });
}

/**
 * Wait for the runner process to be done if its not running in the main process.
 */
if (childProcess) {
  await new Promise((resolve) => {
    childProcess.on("close", resolve);
  });
}

/**
 * Exit the CLI process with the appropriate exit code to make CI fail on any error.
 */
if (!args["--watch"] && !args["--ui"]) {
  process.exit(childProcess?.exitCode ?? process.exitCode ?? 0);
}
