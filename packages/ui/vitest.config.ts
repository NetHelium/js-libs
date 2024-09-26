import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        resources: "usable",
      },
    },
    coverage: {
      enabled: true,
      provider: "v8",
      reportsDirectory: "./test/.coverage",
      include: ["src/**"],
      exclude: ["src/index.ts", "src/events/**", "src/**/*.styles.ts"],
    },
  },
});
