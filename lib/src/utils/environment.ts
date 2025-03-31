/**
 * Check if the code is running in a browser environment or another (like node).
 *
 * @returns `true` if the current environment is a browser and `false` otherwise.
 */
export const isBrowser = () => ![typeof window, typeof document].includes("undefined");
