import { type To } from "history";
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
declare const toAppPath: (to: To) => To | null;
export default toAppPath;
