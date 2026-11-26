import {
	createPath,
	parsePath,
	type Location,
	type Path,
	type To,
} from "history";

/**
 * The location a navigation to a target goes to. A target that leaves out
 * `pathname`, `search` or `hash` is completed from the current location the
 * way `history.push` completes it: a missing pathname stays the current one, a
 * missing search and hash become empty.
 * @param location The current location
 * @param to The target, with leading slashes already collapsed
 * @returns The completed target
 */
export const navigationTarget = (
	location: Location,
	to: To,
): Partial<Path> => ({
	pathname: location.pathname,
	search: "",
	hash: "",
	...(typeof to === "string" ? parsePath(to) : to),
});

/**
 * A path as the URL parser reads it, percent-encoded: a browser history keeps
 * the location encoded ("/%C3%BCber"), a memory history as it was pushed
 * ("/über"). The path goes after a fixed origin and a slash, so no part of it
 * is read as a host.
 * @param path A path, with search and hash
 * @returns The URL of the path
 */
export const normalizedUrl = (path: Partial<Path>): string =>
	new URL(`http://localhost/${createPath(path)}`).href;
