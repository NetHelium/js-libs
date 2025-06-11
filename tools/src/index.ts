import { merge } from "lodash-es";
import type {
  BuildRunnerOptions,
  PackRunnerOptions,
  StorybookRunnerOptions,
  TSCheckRunnerOptions,
  TestRunnerOptions,
} from "./cli/runners";
import type { DeepPartial } from "./utils";

/**
 * Options for the CLI.
 */
export type NhCliOptions = {
  /**
   * Configuration for TypeScript checks.
   */
  check: TSCheckRunnerOptions;

  /**
   * Configuration for tests.
   */
  test: TestRunnerOptions;

  /**
   * Configuration for Storybook.
   */
  storybook: StorybookRunnerOptions;

  /**
   * Configuration for builds.
   */
  build: BuildRunnerOptions;

  /**
   * Configuration for the packing step (`prepack` and `postpack` scripts).
   */
  pack: PackRunnerOptions;
};

/**
 * Default configuration for the CLI.
 */
const defaultCliConfig: NhCliOptions = {
  check: {
    tsconfig: "./tsconfig.json",
  },
  storybook: {
    command: "dev",
    port: 6006,
  },
  test: {
    tsconfig: "./tsconfig.json",
    watch: false,
    ui: false,
    coverage: false,
    regular: {
      enabled: false,
      environment: "node",
    },
    browser: {
      enabled: false,
      browsers: ["chromium"],
      headless: false,
    },
  },
  build: {
    globEntryPoints: [],
    tsconfig: "./tsconfig.json",
    watch: false,
  },
  pack: {
    cleanPackageJson: ["scripts", "devDependencies"],
  },
};

/**
 * Define the desired configuration of the CLI for a project. Any option that is not explicitly
 * configured here will use its default value.
 *
 * @param config the desired configuration for the CLI
 * @returns the full CLI configuration.
 */
export const defineConfig = (config?: DeepPartial<NhCliOptions>): NhCliOptions =>
  config ? merge(defaultCliConfig, config) : defaultCliConfig;
