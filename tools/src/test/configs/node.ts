import path from "node:path";
import { defineConfig } from "vitest/config";
import { getToolsProject } from "../../utils";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: [path.resolve((await getToolsProject())!.path, "dist/test/vitest-setup.js")],
  },
});
