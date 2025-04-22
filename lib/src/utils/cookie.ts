import { isDate } from "./date.js";
import { isBrowser } from "./environment.js";
import type { WithRequired } from "./index.js";

/**
 * Available options that can be set for a cookie.
 */
type CookieOptions = {
  /**
   * The host to which the cookie will be sent. If omitted, it defaults to the host portion of the
   * current document location and the cookie is not available on subdomains. If a domain is
   * specified, all of its subdomains are included.
   *
   * @default undefined
   */
  domain?: string;

  /**
   * The path that must exist in the requested URL in order for the cookie to be sent.
   *
   * @default "/"
   */
  path: string;

  /**
   * The expiry date of the cookie. If both `expires` and `maxAge` are omitted, the cookie will
   * expire at the end of the session. This option is ignored if `maxAge` is set.
   *
   * @default undefined
   */
  expires?: Date;

  /**
   * The number of seconds until the cookie expires. If set to `0` or a negative number, the cookie
   * expires immediately. If both `expires` and `maxAge` are omitted, the cookie will expire at the
   * end of the session. This option has the priority over `expires` if both are set.
   *
   * @default undefined
   */
  maxAge?: number;

  /**
   * Choose wether the cookie is allowed to be accessed by JavaScript in the browser. If set to
   * `true`, the cookie won't be available to the client-side JavaScript. This option will be forced
   * to `false` when trying to set the cookie from the browser (using the `document.cookie` API).
   *
   * @default false
   */
  httpOnly: boolean;

  /**
   * Choose wether the cookie should be sent based on the request's protocol. If set to `true`, the
   * cookie will only be sent if the request was made using the `HTTPS` protocol.
   *
   * @default false
   */
  secure: boolean;

  /**
   * Choose wether the cookie should be sent with cross-site requests (requests originating from a
   * different site compared to the one that set the cookie).
   *
   * `strict` means the cookie will only be sent for requests originating from the same site that
   * set the cookie.
   *
   * `lax` means the same as `strict` except the cookie will also be sent for a cross-site request
   * if that request is a top-level navigation (meaning the request causes the URL shown in the
   * browser's address bar to change) or if the request uses a safe method (`POST`, `PUT` and
   * `DELETE` are methods that are not considered safe for example).
   *
   * `none` means the cookie will be sent with both same-site and cross-site requests. The `secure`
   * option will be forced in this case because the `HTTPS` protocol is mandatory when using this
   * value.
   *
   * @default "lax"
   */
  sameSite: "strict" | "lax" | "none";

  /**
   * Encoding system to use when encoding or decoding the cookie value. If set to `false`, the
   * value won't be encoded or decoded.
   *
   * @default false
   */
  encoding: false | "base64" | "uriComponent";
};

/**
 * Regex to match cookie-name in RFC 6265 sec 4.1.1
 */
const cookieNameRegex = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;

/**
 * Regex to match cookie-value in RFC 6265 sec 4.1.1
 */
const cookieValueRegex = /^[\u0021-\u003A\u003C-\u007E]*$/;

/**
 * RegExp to match domain-value in RFC 6265 sec 4.1.1
 */
const cookieDomainRegex =
  /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;

/**
 * Regex to match path-value in RFC 6265 sec 4.1.1
 */
const cookiePathRegex = /^[\u0020-\u003A\u003D-\u007E]*$/;

/**
 * Serialize data into a cookie string ready to be used with the `document.cookie` API or the
 * `Set-Cookie` header.
 *
 * @param name the cookie name
 * @param value the cookie value
 * @param options the cookie options
 * @returns the cookie string
 */
export const serializeCookie = (name: string, value: unknown, options?: Partial<CookieOptions>) => {
  let cookieOptions: CookieOptions = {
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    encoding: false,
  };

  if (options) {
    cookieOptions = { ...cookieOptions, ...options };
  }

  if (cookieOptions.httpOnly && isBrowser()) {
    cookieOptions.httpOnly = false;
  }

  if (cookieOptions.sameSite === "none") {
    cookieOptions.secure = true;
  }

  if (!cookieNameRegex.test(name)) {
    throw new TypeError(`Cookie name is invalid: ${name}`);
  }

  let cookieValue = typeof value === "object" ? `json:${JSON.stringify(value)}` : String(value);

  switch (cookieOptions.encoding) {
    case "base64":
      cookieValue = isBrowser() ? btoa(cookieValue) : Buffer.from(cookieValue).toString("base64");
      break;
    case "uriComponent":
      cookieValue = encodeURIComponent(cookieValue);
  }

  if (!cookieValueRegex.test(cookieValue)) {
    throw new TypeError(`Cookie value is invalid: ${value}`);
  }

  const cookieData = [`${name}=${cookieValue}`];

  if (cookieOptions.domain) {
    if (!cookieDomainRegex.test(cookieOptions.domain)) {
      throw new TypeError(`domain option is invalid: ${cookieOptions.domain}`);
    }

    cookieData.push(`Domain=${cookieOptions.domain}`);
  }

  if (!cookiePathRegex.test(cookieOptions.path)) {
    throw new TypeError(`path option is invalid: ${cookieOptions.path}`);
  }

  cookieData.push(`Path=${cookieOptions.path}`);

  if (cookieOptions.maxAge) {
    if (!Number.isInteger(cookieOptions.maxAge)) {
      throw new TypeError(`maxAge option is invalid: ${cookieOptions.maxAge}`);
    }

    cookieData.push(`Max-Age=${cookieOptions.maxAge}`);
  }

  if (cookieOptions.expires && !cookieOptions.maxAge) {
    if (!isDate(cookieOptions.expires) || !Number.isFinite(cookieOptions.expires.valueOf())) {
      throw new TypeError(`expires option is invalid: ${cookieOptions.expires}`);
    }

    cookieData.push(`Expires=${cookieOptions.expires.toUTCString()}`);
  }

  if (cookieOptions.httpOnly) {
    cookieData.push("HttpOnly");
  }

  if (cookieOptions.secure) {
    cookieData.push("Secure");
  }

  cookieData.push(
    `SameSite=${cookieOptions.sameSite[0]!.toUpperCase()}${cookieOptions.sameSite.slice(1)}`,
  );

  return cookieData.join("; ");
};

/**
 * Parse a cookie string into an object containing all the cookie data. If the cookie value was
 * encoded when writing the cookie, the decoding method can be provided to automatically decode it.
 *
 * @param cookieString the cookie string
 * @param decoding the function to use to decode the cookie value if it was encoded
 * @returns the parsed data of the cookie
 */
export const parseCookie = (cookieString: string, decoding?: CookieOptions["encoding"]) => {
  const parts = cookieString.split(";").map((part) => part.trim());

  const cookieData: CookieOptions & { name?: string; value?: unknown } = {
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    encoding: decoding ?? false,
  };

  for (const part of parts) {
    let key: string;
    let value: string | undefined;

    if (part.includes("=")) {
      const [k, v] = part.split(/=(.*)/, 2).map((item) => item.trim());
      key = k!;
      value = v;
    } else {
      key = part;
    }

    switch (key) {
      case "Domain":
        cookieData.domain = value;
        break;
      case "Path":
        cookieData.path = value!;
        break;
      case "Expires":
        cookieData.expires = new Date(Date.parse(value!));
        break;
      case "Max-Age":
        cookieData.maxAge = Number.parseInt(value!);
        break;
      case "HttpOnly":
        cookieData.httpOnly = true;
        break;
      case "Secure":
        cookieData.secure = true;
        break;
      case "SameSite":
        cookieData.sameSite = value!.toLowerCase() as CookieOptions["sameSite"];
        break;
      default: {
        // The key-value pair represents the name and the value of the cookie
        cookieData.name = key;
        let decodedValue = value!;

        switch (decoding) {
          case "base64":
            decodedValue = isBrowser()
              ? atob(decodedValue)
              : Buffer.from(decodedValue, "base64").toString();

            break;
          case "uriComponent":
            decodedValue = decodeURIComponent(decodedValue);
        }

        cookieData.value = decodedValue.startsWith("json:")
          ? JSON.parse(decodedValue.slice(5))
          : decodedValue;
      }
    }
  }

  return cookieData as WithRequired<typeof cookieData, "name" | "value">;
};
