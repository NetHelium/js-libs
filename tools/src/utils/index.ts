import { merge } from "lodash-es";
import type {
  BuildRunnerOptions,
  E2eRunnerOptions,
  PackRunnerOptions,
  TSCheckRunnerOptions,
  TestRunnerOptions,
} from "../cli/runners";

export * from "./detectors";
export * from "./fs";
export * from "./io";

/**
 * Make an optional property of T required.
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Make all properties of T optional recursively.
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * Options for the CLI.
 */
export type NhCliOptions = {
  /**
   * Configuration for TypeScript checks.
   */
  check: TSCheckRunnerOptions;

  /**
   * Configuration for unit tests.
   */
  test: TestRunnerOptions;

  /**
   * Configuration for end-to-end tests.
   */
  e2e: E2eRunnerOptions;

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
  test: {
    config: "node",
    codeCoverage: false,
  },
  e2e: {
    config: "default",
    ui: false,
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
