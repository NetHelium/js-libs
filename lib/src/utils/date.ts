/**
 * Determine wether or not `value` is a date object.
 *
 * @param value the input value to test
 * @returns `true` if the value is a date object and `false` otherwise
 */
export const isDate = (value: unknown) => Object.prototype.toString.call(value) === "[object Date]";
