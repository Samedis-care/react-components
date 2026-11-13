import { normalizePath } from "./matchPath";
/**
 * Joins the prefix of the enclosing Route and a child Route's path into the
 * child's full path pattern, with one "/" between them, so a relative child
 * path also resolves under a parent path that does not end in "/*".
 * Routes matches its children and Route builds its RouteContext with it.
 * @param prefix The prefix from useRoutePrefix, e.g. "/devices/" under a
 *               parent "/devices/*", "/devices" under a parent "/devices",
 *               "/" outside of any Route
 * @param path The child Route's path, e.g. "info", "/info", ":id/*" or ""
 * @returns The full path pattern without "//", e.g. "/devices/info" for both
 *          parents above and both "info" and "/info"; "/devices/" for ""
 */
const joinRoutePath = (prefix, path) => normalizePath(prefix + "/" + path);
export default joinRoutePath;
