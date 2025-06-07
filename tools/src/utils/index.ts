export * from "./detectors";
export * from "./fs";
export * from "./io";

/**
 * Make all properties of `T` optional recursively.
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
