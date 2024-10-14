import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "../../vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        reportsDirectory: "./test/.coverage/unit",
        exclude: ["src/index.ts", "src/events/**", "src/internals/**", "src/**/*.styles.ts"],
      },
    },
  }),
);
