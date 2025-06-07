import { TextDecoder, TextEncoder } from "node:util";

/**
 * This is a fix to prevent the test runner from crashing when the `jsdom` environment is used with
 * another environment in the same test run (a different environment can be set for each test file
 * using the special `@vitest-environment` comment).
 *
 * The crash is caused by esbuild (used internally by vitest to transpile TypeScript into JavaScript
 * on the fly when running the tests) because the `TextEncoder` implementation of `jsdom` produces
 * Uint8Array objects that are different from the global node ones and such a difference is not
 * allowed in the same transpilation process.
 *
 * With this fix (more like a workaround), we force the `TextDecoder` and `TextEncoder` to be the
 * ones from the node implementation regardless of the currently active test environment.
 *
 * @see https://github.com/vitest-dev/vitest/issues/4043
 */
Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
});
