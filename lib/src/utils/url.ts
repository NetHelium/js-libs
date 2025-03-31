type UrlWithParamsOptions = {
  /**
   * set to `false` to preserve the values of existing params or `true` to override
   * @default false
   */
  override?: boolean;
};

/**
 * Extract the host and path from a url.
 * @param url the url
 * @returns the host and path or `undefined` if the url is not valid
 */
export const getHostPathFromUrl = (url: string) => {
  let urlInfo: URL;

  try {
    urlInfo = new URL(decodeURIComponent(url));
  } catch {
    return undefined;
  }

  const { host, pathname } = urlInfo;
  return `${host}${pathname === "/" ? "" : pathname}`;
};

/**
 * Extract all the params matching the given `prefixes` from a url.
 * @param url the url
 * @param prefixes the prefixes to look for
 * @returns the params matching the `prefixes`
 */
export const getPrefixedParamsFromUrl = (
  url: string,
  ...prefixes: string[]
): Record<string, string> => {
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
 * @param params the params to add
 * @param options the options
 * @returns the altered url with the new params
 */
export const getUrlWithParams = (
  url: string,
  params: Record<string, string>,
  options?: UrlWithParamsOptions,
) => {
  const override = options?.override ?? false;

  const urlParams: Record<string, string> = [
    ...new URLSearchParams(new URL(url).search).entries(),
  ].reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {});

  const newParams = override ? { ...urlParams, ...params } : { ...params, ...urlParams };

  const queryString = Object.keys(newParams)
    .map((key) => `${key}=${encodeURIComponent(newParams[key]!)}`)
    .join("&");

  return `${url.split("?")[0]}?${queryString}`;
};
