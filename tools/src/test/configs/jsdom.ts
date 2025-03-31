import { defineConfig, mergeConfig } from "vitest/config";
import nodeConfig from "./node";

export default mergeConfig(
  nodeConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      environmentOptions: {
        jsdom: {
          resources: "usable",
        },
      },
    },
  }),
);
