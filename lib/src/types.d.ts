/**
 * Object using strings for keys and values.
 */
export type StringObject = {
  [key: string]: string;
};

/**
 * Type for a nested object using strings for keys and values.
 */
export type NestedStringObject = {
  [key: string]: NestedStringObject | string;
};
