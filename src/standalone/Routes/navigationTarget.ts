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

/**
 * Does a navigation to the target stay at the current location? Pathname,
 * search and hash are compared as the URL parser reads them, so "/über" is the
 * current location at "/%C3%BCber"; the state is not compared. A click on a
 * link to the current location replaces the history entry instead of pushing
 * a second one, as a browser does for a plain `<a>`.
 * @param location The current location
 * @param to The target, with leading slashes already collapsed
 */
export const isCurrentLocation = (location: Location, to: To): boolean =>
	normalizedUrl(navigationTarget(location, to)) === normalizedUrl(location);
