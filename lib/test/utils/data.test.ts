import { describe, expect, it } from "@net-helium/tools/test";
import { flat, isObject, search } from "../../src/utils/data.js";

describe.concurrent("[lib] utils/data", () => {
  it("should detect if a value is an object", () => {
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject("test")).toBe(false);
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
    expect(isObject({})).toBe(true);
    expect(isObject({ key: "value" })).toBe(true);
  });

  it("should remove nested arrays in a data structure", () => {
    expect(flat([1, [2, [3, { a: 4, b: [5, [6, [7]]] }]], 8])).toEqual([
      1,
      2,
      3,
      { a: 4, b: [5, 6, 7] },
      8,
    ]);

    expect(flat({ a: 5, b: [[7, { c: 6, d: [[4, 3], 8], e: { f: [2, [3]] } }]] })).toEqual({
      a: 5,
      b: [7, { c: 6, d: [4, 3, 8], e: { f: [2, 3] } }],
    });
  });

  it("should find data in a nested structure of objects and arrays", () => {
    let data: unknown = {
      key1: [
        [
          {
            key2: {
              key3: 123,
            },
          },
          {
            key2: [
              {
                key3: ["value 1"],
              },
            ],
          },
        ],
        {
          key2: {
            key3: [[123], "value 2"],
          },
        },
      ],
      key4: [123],
    };

    expect(search(data, "key1.key2.key3")).toEqual([123, "value 1", [123, "value 2"]]);
    expect(search(data, "key4")).toEqual([123]);
    data = [[4, 5], data];
    expect(search(data, "key1.key2.key3")).toEqual([123, "value 1", [123, "value 2"]]);
  });
});
