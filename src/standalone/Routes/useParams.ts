import { useContext, useMemo } from "react";
import { RouteContext } from "./Route";
import { useHistoryRouterContext } from "./HistoryRouter";
import matchPath from "./matchPath";

/**
 * Use route params
 * The params of the nearest Route, whose path includes the paths of the Routes
 * around it: under "/t/:tenantId/*" > ":id", "/t/T1/R9" gives
 * `{ tenantId: "T1", id: "R9" }`.
 * The nearest Route wins: a param named like a param of a Route around it hides
 * that Route's value. Under "/t/:id/*" > ":id", "/t/T1/R9" gives `{ id: "R9" }`
 * inside the nested Route and `{ id: "T1" }` in the parent's element outside of
 * it. To read both inside, give the params different names, or read the
 * parent's value in its element and pass it down. CRUD shows a record through
 * a nested Route ":id/*": name the param of a Route around a CRUD otherwise
 * (`:tenantId`) to read it in the record page.
 * Each value is percent-decoded: "foo bar" at "foo%20bar", see
 * `PathMatch.params`.
 * It returns the same object while the url and path of the nearest Route stay
 * the same, so an effect or memo that depends on it runs again when a param
 * changes, not on every navigation: "/devices/1" to "/devices/1/edit" under
 * "/devices/:id/*" keeps it. Outside of every Route it returns `{}`.
 * Throws outside a HistoryRouter; Framework renders one.
 */
const useParams = <T extends string = string>(): Partial<Record<T, string>> => {
	// throws outside a HistoryRouter; unlike the location, it stays the same on a navigation
	useHistoryRouterContext();
	const route = useContext(RouteContext);
	const path = route ? route.path : null;
	const url = route ? route.url : null;
	// the params come from the segments the route matches, which are its url: the rest of the
	// location doesn't change them
	return useMemo(
		(): Partial<Record<T, string>> =>
			path === null || url === null
				? {}
				: ((matchPath({ path }, url)?.params as
						Partial<Record<T, string>> | undefined) ?? {}),
		[path, url],
	);
};

export default useParams;
