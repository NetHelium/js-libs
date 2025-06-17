export { merge } from "lodash-es";

/**
 * Generate a random id composed of letters (a to f), numbers (0 to 9) and optionally dashes.
 *
 * @param options the options to change the generation behavior
 * @returns the generated id
 */
export const randomId = (options?: {
  /**
   * The length desired. If omitted, it will be the length of a `uuid v4` (36 characters with dashes
   * or 32 characters without).
   *
   * @default undefined
   */
  length?: number;

  /**
   * Wether the generated id should have dashes.
   *
   * @default false
   */
  dashes?: boolean;
}) => {
  const length = options?.length;
  const dashes = options?.dashes ?? false;
  let id = "";

  do {
    id += `${id === "" ? "" : "-"}${crypto.randomUUID()}`;
    if (!dashes) id = id.replaceAll("-", "");
  } while (length && length > id.length);

  return length ? id.slice(0, length) : id;
};

/**
 * Determine wether or not `value` is an object.
 *
 * @param value the input value to test
 * @returns `true` if the value is an object and `false` otherwise
 */
export const isObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === "[object Object]";

/**
 * Remove nested arrays from a data structure.
 *
 * @param data the data structure
 * @returns the flattened data structure
 */
export const flat = (data: unknown) => {
  // For arrays, flatten each item and concatenate results
  if (Array.isArray(data)) {
    return data.reduce<unknown[]>((acc, item) => {
      acc = acc.concat(flat(item));
      return acc;
    }, []);
  }

  // For objects, recursively flatten array properties
  if (isObject(data)) {
    const result: Record<string, unknown> = {};

    for (const key in data) {
      if (Array.isArray(data[key]) || isObject(data[key])) {
        result[key] = flat(data[key]);
      } else {
        result[key] = data[key];
      }
    }

    return result;
  }

  // Primitive value returned as-is
  return data;
};

/**
 * Search a data structure with the given key.
 *
 * @param data the data structure
 * @param key the key of the data to find
 * @returns the matching data
 */
export const search = (data: unknown, key: string) => {
  const identifiers = key.split(".");
  let matches: unknown[] = [];

  for (const [idx, identifier] of identifiers.entries()) {
    const structure = flat(idx === 0 ? data : matches);
    matches = [];

    if (Array.isArray(structure)) {
      for (const item of structure) {
        if (isObject(item)) {
          if (item[identifier]) {
            if (Array.isArray(item[identifier]) && item[identifier].length === 1) {
              matches.push(item[identifier][0]);
            } else {
              matches.push(item[identifier]);
            }
          }
        }
      }
    }

    if (isObject(structure)) {
      if (structure[identifier]) {
        if (Array.isArray(structure[identifier]) && structure[identifier].length === 1) {
          matches.push(structure[identifier][0]);
        } else {
          matches.push(structure[identifier]);
        }
      }
    }
  }

  return matches;
};
