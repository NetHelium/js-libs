import type { ChildProcess } from "node:child_process";
import path from "node:path";
import arg from "arg";
import { build } from "esbuild";
import { type NhCliOptions, defineConfig } from "../";
import { cmd, pathExists } from "../utils";
import {
  type StorybookRunnerOptions,
  type TestRunnerOptions,
  browsers as availableBrowsers,
  commands as availableCommands,
  environments as availableEnvironments,
  buildRunner,
  devRunner,
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
 * Command-line options of the CLI. These options will have the priority over the project's
 * configuration file.
 */
const args = arg({
  /**
   * Enable browser tests.
   */
  "--browser": Boolean,

  /**
   * List of browser engines to use when running browser tests. The engines should be separated by
   * a comma.
   *
   * @example --browsers=chromium,firefox,webkit
   */
  "--browsers": String,

  /**
   * Command to pass to the runner if applicable.
   */
  "--cmd": String,

  /**
   * Enable tests coverage. Details of the coverage will be accessible in the web interface when
   * used with the `--ui` option.
   */
  "--coverage": Boolean,

  /**
   * Default environment for regular tests. Choose between `node` or `jsdom`.
   *
   * @example --env=jsdom
   */
  "--env": String,

  /**
   * Run the browser tests in headless mode (without the browser's ui) which is useful for CI.
   */
  "--headless": Boolean,

  /**
   * Port to use if applicable to the targeted runner.
   */
  "--port": Number,

  /**
   * Enable regular tests.
   */
  "--regular": Boolean,

  /**
   * Use the restore mode in the packing process.
   */
  "--restore": Boolean,

  /**
   * The TypeScript configuration to use while transpiling during tests execution.
   */
  "--tsconfig": String,

  /**
   * Enable the UI mode to visualize the test results in a web interface.
   */
  "--ui": Boolean,

  /**
   * Run the tests in watch mode which is useful while in development.
   */
  "--watch": Boolean,

  // Aliases
  "-b": "--browser",
  "-c": "--coverage",
  "-e": "--env",
  "-p": "--port",
  "-r": "--regular",
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
  const isValidCommand = (command: string): command is StorybookRunnerOptions["command"] =>
    availableCommands.includes(command as StorybookRunnerOptions["command"]);

  const command = args["--cmd"] || cliOptions.storybook.command;

  await storybookRunner({
    command: isValidCommand(command) ? command : "dev",
    port: args["--port"] || cliOptions.storybook.port,
  });
}

/**
 * Tests runner for `node`, `jsdom` and `browser` test files.
 */
if (args._.includes("test")) {
  const isValidEnv = (
    environment: string,
  ): environment is TestRunnerOptions["regular"]["environment"] =>
    availableEnvironments.includes(environment as TestRunnerOptions["regular"]["environment"]);

  const isValidBrowserList = (
    browsers: string[],
  ): browsers is TestRunnerOptions["browser"]["browsers"] =>
    browsers.every((browser) =>
      availableBrowsers.includes(browser as TestRunnerOptions["browser"]["browsers"][number]),
    );

  const environment = args["--env"] || cliOptions.test.regular.environment;
  const browsers = args["--browsers"]?.split(",") || cliOptions.test.browser.browsers;

  await testRunner({
    tsconfig: args["--tsconfig"] || cliOptions.test.tsconfig,
    watch: args["--watch"] ?? cliOptions.test.watch,
    ui: args["--ui"] ?? cliOptions.test.ui,
    coverage: args["--coverage"] ?? cliOptions.test.coverage,
    regular: {
      enabled: args["--regular"] || cliOptions.test.regular.enabled,
      environment: isValidEnv(environment) ? environment : "node",
    },
    browser: {
      enabled: args["--browser"] || cliOptions.test.browser.enabled,
      browsers: isValidBrowserList(browsers) ? browsers : ["chromium"],
      headless: args["--headless"] || cliOptions.test.browser.headless,
    },
  });
}

/**
 * Build runner.
 */
if (args._.includes("build")) {
  const buildProcess = await buildRunner({
    ...cliOptions.build,
    tsconfig: args["--tsconfig"] || cliOptions.build.tsconfig,
    watch: args["--watch"] ?? cliOptions.build.watch,
  });

  if (buildProcess) childProcess = buildProcess;
}

/**
 * Pack runner to prepare publishing of a package.
 */
if (args._.includes("pack")) {
  await packRunner({
    cleanPackageJson: cliOptions.pack.cleanPackageJson,
    restore: !!args["--restore"],
  });
}

/**
 * Wait for the runner process to be done if it's not running in the main process and set the exit
 * code to the result of the runner in order to make CI fail if there was an error.
 */
if (childProcess) {
  await new Promise((resolve) => {
    childProcess.on("close", resolve);
  });

  if (childProcess.exitCode) {
    process.exitCode = childProcess.exitCode;
  }
}
