/**
 * [Helium Connect] Process a string to replace all occurrences of placeholders with their
 * corresponding values in the given eligible params.
 * @param str the string to process
 * @param params the params containing the replacements
 * @returns the processed string
 */
export const hcProcessPlaceholders = (str: string, params: Record<string, string>) => {
  let result = str;

  for (const [key, value] of Object.entries(params)) {
    if (key === "hc_contact_code") {
      result = result.replaceAll("$CODE_CONTACT$", value);
    }
  }

  return result;
};
