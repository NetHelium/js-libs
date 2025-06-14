export * from "./cookie.js";
export * from "./data.js";
export * from "./date.js";
export * from "./environment.js";
export * from "./url.js";

/**
 * Make all properties of `T` optional except the ones specified by `K`.
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Make all properties of `T` required except the ones specified by `K`.
 */
export type RequiredExcept<T, K extends keyof T> = Required<T> & Pick<T, K>;

/**
 * Make the properties specified by `K` optional in `T`.
 */
export type WithPartial<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

/**
 * Make the properties specified by `K` required in `T`.
 */
export type WithRequired<T, K extends keyof T> = Pick<Required<T>, K> & Omit<T, K>;
