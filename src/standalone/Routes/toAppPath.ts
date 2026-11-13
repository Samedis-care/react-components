import { parsePath, type To } from "history";

/** What the URL parser drops before it reads a URL: tabs and newlines */
const IGNORED_CHARS = /[\t\n\r]/g;
/** What the URL parser drops before it reads a URL: leading controls and spaces */
const LEADING_CONTROLS = /^[\0-\x20]+/;
/** A URL scheme ("https:", "mailto:", "javascript:"): the target is a URL of its own */
const SCHEME = /^[a-z][a-z\d+.-]*:/i;
/** Two or more leading slashes, a protocol-relative URL ("//host/path"); the URL parser reads "\" as "/" */
const LEADING_SLASHES = /^[/\\]{2,}/;

/**
 * The path inside the app that a navigation target stands for, as
 * `useNavigate` and `Link` hand it to the history.
 * - Leading slashes collapse into one: "//7" becomes "/7". "//7" is what
 *   `${useRouteInfo().url}/7` gives under a route that matches at the root,
 *   and the browser would read it as the host "7" (a protocol-relative URL).
 * - A target with a scheme ("https://…", "mailto:…", "javascript:…") is not a
 *   path of the app.
 *
 * Both follow the URL parser, which also reads "\" as "/" and ignores tabs,
 * newlines and leading spaces and control characters.
 * @param to The navigation target, a path or a location object
 * @returns The target, with leading slashes collapsed, or null if it has a
 *          scheme. A target that needs no change is returned as it is.
 */
const toAppPath = (to: To): To | null => {
	const pathname =
		typeof to === "string" ? parsePath(to).pathname : to.pathname;
	if (!pathname) return to; // keeps the current path
	const parsed = pathname
		.replace(IGNORED_CHARS, "")
		.replace(LEADING_CONTROLS, "");
	if (SCHEME.test(parsed)) return null;
	if (!LEADING_SLASHES.test(parsed)) return to;
	const appPathname = parsed.replace(LEADING_SLASHES, "/");
	return typeof to === "string"
		? appPathname + to.substring(pathname.length)
		: { ...to, pathname: appPathname };
};

export default toAppPath;
