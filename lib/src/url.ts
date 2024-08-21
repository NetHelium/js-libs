export type URLParams = {
  [key: string]: string;
};

/**
 * Extract the host and path from a url.
 * @param url the url
 * @returns the host and path
 */
export const getHostPathFromUrl = (url: string) => {
  const { host, pathname } = new URL(decodeURIComponent(url));
  return `${host}${pathname === "/" ? "" : pathname}`;
};

/**
 * Extract all the params matching the given `prefixes` from a url.
 * @param url the url
 * @param prefixes the prefixes to look for
 * @returns the params matching the `prefixes` as a `URLParams` object
 */
export const getPrefixedParamsFromUrl = (url: string, ...prefixes: string[]): URLParams => {
  const urlParams = [...new URLSearchParams(new URL(url).search).entries()];
  let extractedParams: [string, string][] = [];

  for (const prefix of prefixes) {
    extractedParams = [
      ...extractedParams,
      ...urlParams.filter((entry) => entry[0].substring(0, prefix.length) === prefix),
    ];
  }

  return extractedParams.reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {});
};

/**
 * Merge the existing params of the given `url` with the given `params`.
 * @param url the original url
 * @param params the params to add as a `URLParams` object
 * @param override set to `false` to preserve the values of existing params or `true` to override
 * them (default is `true`)
 * @returns the altered url with the new params
 */
export const addParamsToUrl = (url: string, params: URLParams, override = true) => {
  const urlParams: URLParams = [...new URLSearchParams(new URL(url).search).entries()].reduce(
    (acc, [key, value]) => Object.assign(acc, { [key]: value }),
    {},
  );

  const newParams = override ? { ...urlParams, ...params } : { ...params, ...urlParams };

  const queryString = Object.keys(newParams)
    .map((key) => `${key}=${encodeURIComponent(newParams[key]!)}`)
    .join("&");

  return `${url.split("?")[0]}?${queryString}`;
};
