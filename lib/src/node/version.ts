/**
 * Compare the runtime version with the provided one.
 *
 * @param version the version to compare with
 * @param options the comparison options
 * @returns `true` if the runtime version passes the comparison and `false` otherwise
 */
export const isNode = (
  /**
   * Node version to compare with the one used at runtime.
   */
  version: string,

  /**
   * Comparison options.
   */
  options?: {
    /**
     * The operation to use for the comparison.
     *
     * `<` means the runtime version has to be lower than the provided one.
     *
     * `<=` means the runtime version has to be lower than or equal to the provided one.
     *
     * `=` means the runtime version has to be equal to the provided one.
     *
     * `>=` means the runtime version has to be higher than or equal to the provided one.
     *
     * `>` means the runtime version has to be higher than the provided one.
     *
     * @default "="
     */
    filter?: "<" | "<=" | "=" | ">=" | ">";

    /**
     * The version level to check for the comparison.
     *
     * `major` means only the major version will be checked.
     *
     * `minor` means both the major and the minor versions will be checked.
     *
     * `patch` means all versions will be checked.
     *
     * @default "patch"
     */
    level?: "major" | "minor" | "patch";
  },
) => {
  const [targetMajor, targetMinor, targetPatch] = version.split(".").map(Number);
  const [runtimeMajor, runtimeMinor, runtimePatch] = process.versions.node.split(".").map(Number);
  const level = options?.level;

  if ([targetMajor, targetMinor, targetPatch].some((v) => v === undefined || Number.isNaN(v))) {
    throw new Error(`The provided version to check against is invalid: ${version}`);
  }

  switch (options?.filter) {
    case "<":
      switch (level) {
        case "major":
          return runtimeMajor! < targetMajor!;
        case "minor":
          return (
            runtimeMajor! < targetMajor! ||
            (runtimeMajor === targetMajor && runtimeMinor! < targetMinor!)
          );
        default:
          return (
            runtimeMajor! < targetMajor! ||
            (runtimeMajor === targetMajor && runtimeMinor! < targetMinor!) ||
            (runtimeMajor === targetMajor &&
              runtimeMinor === targetMinor &&
              runtimePatch! < targetPatch!)
          );
      }
    case "<=":
      switch (level) {
        case "major":
          return runtimeMajor! <= targetMajor!;
        case "minor":
          return (
            runtimeMajor! < targetMajor! ||
            (runtimeMajor === targetMajor && runtimeMinor! <= targetMinor!)
          );
        default:
          return (
            runtimeMajor! < targetMajor! ||
            (runtimeMajor === targetMajor && runtimeMinor! < targetMinor!) ||
            (runtimeMajor === targetMajor &&
              runtimeMinor === targetMinor &&
              runtimePatch! <= targetPatch!)
          );
      }
    case ">=":
      switch (level) {
        case "major":
          return runtimeMajor! >= targetMajor!;
        case "minor":
          return (
            runtimeMajor! > targetMajor! ||
            (runtimeMajor === targetMajor && runtimeMinor! >= targetMinor!)
          );
        default:
          return (
            runtimeMajor! > targetMajor! ||
            (runtimeMajor === targetMajor && runtimeMinor! > targetMinor!) ||
            (runtimeMajor === targetMajor &&
              runtimeMinor === targetMinor &&
              runtimePatch! >= targetPatch!)
          );
      }
    case ">":
      switch (level) {
        case "major":
          return runtimeMajor! > targetMajor!;
        case "minor":
          return (
            runtimeMajor! > targetMajor! ||
            (runtimeMajor === targetMajor && runtimeMinor! > targetMinor!)
          );
        default:
          return (
            runtimeMajor! > targetMajor! ||
            (runtimeMajor === targetMajor && runtimeMinor! > targetMinor!) ||
            (runtimeMajor === targetMajor &&
              runtimeMinor === targetMinor &&
              runtimePatch! > targetPatch!)
          );
      }
    default:
      switch (level) {
        case "major":
          return runtimeMajor === targetMajor;
        case "minor":
          return runtimeMajor === targetMajor && runtimeMinor === targetMinor;
        default:
          return (
            runtimeMajor === targetMajor &&
            runtimeMinor === targetMinor &&
            runtimePatch === targetPatch
          );
      }
  }
};
