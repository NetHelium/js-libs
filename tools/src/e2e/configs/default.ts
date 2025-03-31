import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

const appUrl = "http://localhost:4321";

/**
 * E2E configuration.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  /**
   * Tests location
   */
  testDir: path.resolve(process.cwd(), "e2e"),

  /**
   * Run tests in files in parallel
   */
  fullyParallel: true,

  /**
   * Fail the build on CI if you accidentally left test.only in the source code.
   */
  forbidOnly: !!process.env.CI,

  /**
   * Retry on CI only
   */
  retries: process.env.CI ? 2 : 0,

  /**
   * Opt out of parallel tests on CI.
   */
  workers: process.env.CI ? 1 : undefined,

  /**
   * Reporter to use.
   *
   * @see https://playwright.dev/docs/test-reporters
   */
  reporter: "dot",

  /**
   * Output directory to use for files created during the test execution.
   */
  outputDir: path.resolve(process.cwd(), ".nh/e2e"),

  /**
   * Shared settings for all the projects below.
   *
   * @see https://playwright.dev/docs/api/class-testoptions
   */
  use: {
    /**
     * Base URL to use in actions like `await page.goto('/')`.
     */
    baseURL: appUrl,

    /**
     * Collect trace when retrying the failed test.
     *
     * @see https://playwright.dev/docs/trace-viewer
     */
    trace: "on-first-retry",
  },

  /**
   * Configure projects for major browsers.
   */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  /**
   * Run the app's server before starting the tests.
   */
  webServer: {
    command: "pnpm --filter @net-helium/app dev",
    url: appUrl,
    reuseExistingServer: !process.env.CI,
  },
});
