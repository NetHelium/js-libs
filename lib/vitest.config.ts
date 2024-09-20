import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    coverage: {
      enabled: true,
      provider: "v8",
      reportsDirectory: "./test/.coverage",
      include: ["src/**"],
      exclude: ["src/index.ts", "src/ui/index.ts", "src/ui/events/**", "src/**/*.styles.ts"],
    },
  },
});
