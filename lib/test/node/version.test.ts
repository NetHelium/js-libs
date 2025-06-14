import { beforeEach, describe, expect, it, vi } from "@net-helium/tools/test";
import { isNode } from "../../src/node/index.js";

describe("[lib] node/version", () => {
  const actualRuntimeVersions = process.versions;
  const nodeVersionsGetter = vi.spyOn(process, "versions", "get");

  const changeNodeVersion = (version: string) => {
    nodeVersionsGetter.mockReturnValue({
      ...actualRuntimeVersions,
      node: version,
    });
  };

  beforeEach(() => {
    changeNodeVersion(actualRuntimeVersions.node);
  });

  it("should throw if the provided node version is invalid", () => {
    expect(() => isNode("23.0.0")).not.toThrowError();
    expect(() => isNode("23.0")).toThrowError();
    expect(() => isNode("23")).toThrowError();
    expect(() => isNode("v23.0.0")).toThrowError();
  });

  it("should compare at the major level between the runtime node and the provided one", () => {
    // Lower major
    changeNodeVersion("21.0.0");
    expect(isNode("22.13.1", { filter: "<", level: "major" })).toBe(true);
    expect(isNode("22.13.1", { filter: "<=", level: "major" })).toBe(true);
    expect(isNode("22.13.1", { filter: "=", level: "major" })).toBe(false);
    expect(isNode("22.13.1", { filter: ">=", level: "major" })).toBe(false);
    expect(isNode("22.13.1", { filter: ">", level: "major" })).toBe(false);

    // Same major
    changeNodeVersion("22.0.0");
    expect(isNode("22.13.1", { filter: "<", level: "major" })).toBe(false);
    expect(isNode("22.13.1", { filter: "<=", level: "major" })).toBe(true);
    expect(isNode("22.13.1", { filter: "=", level: "major" })).toBe(true);
    expect(isNode("22.13.1", { filter: ">=", level: "major" })).toBe(true);
    expect(isNode("22.13.1", { filter: ">", level: "major" })).toBe(false);

    // Higher major
    changeNodeVersion("23.0.0");
    expect(isNode("22.13.1", { filter: "<", level: "major" })).toBe(false);
    expect(isNode("22.13.1", { filter: "<=", level: "major" })).toBe(false);
    expect(isNode("22.13.1", { filter: "=", level: "major" })).toBe(false);
    expect(isNode("22.13.1", { filter: ">=", level: "major" })).toBe(true);
    expect(isNode("22.13.1", { filter: ">", level: "major" })).toBe(true);
  });

  it("should compare at the minor level between the runtime node and the provided one", () => {
    // Lower minor
    changeNodeVersion("22.12.4");
    expect(isNode("22.13.1", { filter: "<", level: "minor" })).toBe(true);
    expect(isNode("22.13.1", { filter: "<=", level: "minor" })).toBe(true);
    expect(isNode("22.13.1", { filter: "=", level: "minor" })).toBe(false);
    expect(isNode("22.13.1", { filter: ">=", level: "minor" })).toBe(false);
    expect(isNode("22.13.1", { filter: ">", level: "minor" })).toBe(false);

    // Same minor
    changeNodeVersion("22.13.4");
    expect(isNode("22.13.1", { filter: "<", level: "minor" })).toBe(false);
    expect(isNode("22.13.1", { filter: "<=", level: "minor" })).toBe(true);
    expect(isNode("22.13.1", { filter: "=", level: "minor" })).toBe(true);
    expect(isNode("22.13.1", { filter: ">=", level: "minor" })).toBe(true);
    expect(isNode("22.13.1", { filter: ">", level: "minor" })).toBe(false);

    // Higher minor
    changeNodeVersion("22.14.4");
    expect(isNode("22.13.1", { filter: "<", level: "minor" })).toBe(false);
    expect(isNode("22.13.1", { filter: "<=", level: "minor" })).toBe(false);
    expect(isNode("22.13.1", { filter: "=", level: "minor" })).toBe(false);
    expect(isNode("22.13.1", { filter: ">=", level: "minor" })).toBe(true);
    expect(isNode("22.13.1", { filter: ">", level: "minor" })).toBe(true);
  });

  it("should compare at the patch level between the runtime node and the provided one", () => {
    // Lower patch
    changeNodeVersion("22.13.0");
    expect(isNode("22.13.1", { filter: "<", level: "patch" })).toBe(true);
    expect(isNode("22.13.1", { filter: "<=", level: "patch" })).toBe(true);
    expect(isNode("22.13.1", { filter: "=", level: "patch" })).toBe(false);
    expect(isNode("22.13.1", { filter: ">=", level: "patch" })).toBe(false);
    expect(isNode("22.13.1", { filter: ">", level: "patch" })).toBe(false);

    // Same patch
    changeNodeVersion("22.13.1");
    expect(isNode("22.13.1", { filter: "<", level: "patch" })).toBe(false);
    expect(isNode("22.13.1", { filter: "<=", level: "patch" })).toBe(true);
    expect(isNode("22.13.1", { filter: "=", level: "patch" })).toBe(true);
    expect(isNode("22.13.1", { filter: ">=", level: "patch" })).toBe(true);
    expect(isNode("22.13.1", { filter: ">", level: "patch" })).toBe(false);

    // Higher patch
    changeNodeVersion("22.13.2");
    expect(isNode("22.13.1", { filter: "<", level: "patch" })).toBe(false);
    expect(isNode("22.13.1", { filter: "<=", level: "patch" })).toBe(false);
    expect(isNode("22.13.1", { filter: "=", level: "patch" })).toBe(false);
    expect(isNode("22.13.1", { filter: ">=", level: "patch" })).toBe(true);
    expect(isNode("22.13.1", { filter: ">", level: "patch" })).toBe(true);

    // Default options should be `=` and `patch`
    expect(isNode("22.13.1")).toBe(false);
    expect(isNode("22.13.2")).toBe(true);
    expect(isNode("22.13.3")).toBe(false);
  });
});
