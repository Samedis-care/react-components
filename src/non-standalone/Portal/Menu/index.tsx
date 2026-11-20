import React, {
	Dispatch,
	SetStateAction,
	useContext,
	useEffect,
	useRef,
} from "react";
import { parsePath } from "history";
import {
	getMissingRouteParameters,
	insertRouteParameters,
} from "../../../utils/routeUtils";
import matchPath, { normalizePath } from "../../../standalone/Routes/matchPath";
import joinRoutePath from "../../../standalone/Routes/joinRoutePath";
import { RouteContext, useRoutePrefix } from "../../../standalone/Routes/Route";
import MenuBase, {
	IMenuItemDefinition,
	MenuProps,
} from "../../../standalone/Portal/Menu";
import useLocation from "../../../standalone/Routes/useLocation";
import useNavigate, {
	NavigateFunction,
} from "../../../standalone/Routes/useNavigate";

export interface IRoutedMenuItemDefinition extends Omit<
	IMenuItemDefinition,
	"onClick" | "children"
> {
	/**
	 * The URL to navigate to in case the menu item is clicked
	 *
	 * A path of the app, such as `/devices`, `/apps/:app/roles`, `/devices/*`
	 * or `/tasks?tab=open`, not a URL (open an external page from `onClick`).
	 * Its path decides when the entry is highlighted, and the same path, with
	 * its params filled in, is where a click goes:
	 * - A trailing `/*`, the form a parent Route's path takes, is not part of
	 *   the target: `/devices/*` is highlighted where `/devices` is and
	 *   navigates to `/devices`.
	 * - A search and a hash go into the target and play no part in the
	 *   highlight: `/tasks?tab=open` navigates to `/tasks?tab=open` and is
	 *   highlighted on `/tasks` with any search, so entries that differ only in
	 *   their search or hash match the same pages. The current URL's search and
	 *   hash are not kept.
	 * - A route without a leading slash is relative to the Route the menu is
	 *   rendered in. Inside `<Route path="/apps/:app/*">`, `users` is
	 *   highlighted on `/apps/a1/users` and navigates there from every page
	 *   below `/apps/a1`, including pages that no entry matches. Outside of any
	 *   Route it is the same as `/users`.
	 *
	 * The route matches the current URL as a prefix: `/devices` matches
	 * `/devices/5/edit` (`/` matches only `/`). When several entries of the
	 * menu tree match, at any level and in any group, the most specific one is
	 * highlighted and the groups above it are expanded: an exact match before
	 * a prefix match, then the route with more segments, then, segment by
	 * segment from the left, a literal before a `:name` param (`/apps/new`
	 * before `/apps/:app`), then a route without a trailing `/*` before one
	 * with. On a tie the deeper entry wins (a group's entry with the group's
	 * own route), then the earlier one. The highlight follows the URL only: on
	 * a path that no entry matches, nothing is highlighted, and an entry
	 * without `route` (an action such as "Log out") is never highlighted.
	 *
	 * Its `:name` params are filled from the current URL, read with the route
	 * of that best-matching entry: on `/projects/42/review`,
	 * `/projects/:id/capture` navigates to `/projects/42/capture`. The values
	 * go in percent-encoded, so a value with "/" stays one segment. While the
	 * current URL has no value for one of its params, the entry is hidden
	 * (with its children), as if `shouldRender` were false, and in development
	 * a `console.error` names the entry and the param (once per menu, entry
	 * and param). An entry meant only for pages that provide its params gets
	 * `shouldRender: false` on the other pages from the app. The part of a
	 * relative route that stands for the enclosing Route is taken from the
	 * current URL as that Route matched it.
	 */
	route?: string;
	/**
	 * Keeps the group expanded on every page
	 *
	 * Default `false`: RoutedMenu expands a group by itself while the entry of
	 * the current URL is inside it. With `true` the group is expanded on the
	 * other pages too. While a group is expanded this way, a click on it does
	 * not collapse it (MenuBase). No effect on an entry without children.
	 */
	forceExpand?: boolean;
	/**
	 * An additional onClick action to be executed
	 */
	onClick?: React.MouseEventHandler;
	/**
	 * Children of this menu entry
	 */
	children?: IRoutedMenuItemDefinition[];
}

export interface IRoutedMenuProps extends Omit<
	MenuProps,
	"definition" | "customState"
> {
	/**
	 * The menu definition (with routing support)
	 */
	definition: IRoutedMenuItemDefinition[];
}

/**
 * The entry of the menu tree that matches the current path best
 */
interface MenuRouteMatch {
	/**
	 * The entry's menu item id: the titles from the top level, joined by `@`
	 */
	id: string;
	/**
	 * The menu item ids of the groups above the entry, outermost first
	 */
	groups: string[];
	/**
	 * The params read from the path with the entry's route, percent-encoded
	 * again to fill the routes of the entries
	 */
	params: Record<string, string>;
}

/**
 * What a relative route is resolved against: the Route the menu is rendered
 * in, or the root outside of any Route
 */
interface RouteBase {
	/**
	 * The Route's path pattern as a prefix (useRoutePrefix): "/apps/:app/"
	 * for the Route "/apps/:app/*", "/" outside of any Route
	 */
	path: string;
	/**
	 * The part of the current path the Route matched, percent-encoded as in
	 * the location: "/apps/a1"; "/" outside of any Route
	 */
	url: string;
}

/**
 * An entry's route, read the same way for the highlight and the navigation
 */
interface ResolvedRoute {
	/**
	 * The absolute path pattern the entry is highlighted by, without search
	 * and hash
	 */
	pattern: string;
	/**
	 * The path of the navigation target, its `:name` params still to fill in:
	 * the route's path without search, hash and a trailing `/*`; relative to
	 * `base` for a relative route
	 */
	path: string;
	/**
	 * The path that `path` is appended to: the enclosing Route's url for a
	 * relative route, null for an absolute one
	 */
	base: string | null;
	/**
	 * The route's search and hash, appended to the target
	 */
	suffix: string;
}

/**
 * Reads an entry's route: the pattern it matches the current path with and
 * the parts of its navigation target, see IRoutedMenuItemDefinition's `route`
 * @param route The entry's route, e.g. `/devices/*`, `/tasks?tab=open` or
 * `users`
 * @param base What a relative route is resolved against
 */
const resolveRoute = (route: string, base: RouteBase): ResolvedRoute => {
	const { pathname = "", search = "", hash = "" } = parsePath(route);
	const relative = !pathname.startsWith("/");
	// a trailing "*" segment matches any rest, it is no part of a target
	const path = pathname.replace(/(^|\/)\*$/, "");
	return {
		pattern: relative ? joinRoutePath(base.path, pathname) : pathname,
		path: relative || path ? path : "/",
		base: relative ? base.url : null,
		suffix: search + hash,
	};
};

/**
 * How specific a matching route is, see compareSpecificity
 */
interface RouteSpecificity {
	/**
	 * The route covers every segment of the path
	 */
	exact: boolean;
	/**
	 * Per segment of the route (without a trailing `*`): 2 for a literal, 1 for
	 * a `:name` param, 0 for a `*`
	 */
	segments: number[];
	/**
	 * The route ends in `*`
	 */
	splat: boolean;
	/**
	 * The depth of the entry in the menu tree, 0 on the top level
	 */
	depth: number;
}

/**
 * The menu item id of an entry, as MenuBase builds it
 * @param parent The menu item id of the group above the entry, null on the
 * top level
 * @param title The entry's title
 */
const getItemId = (parent: string | null, title: string): string =>
	parent ? `${parent}@${title}` : title;

/**
 * The segments of a route or path, as matchPath splits them
 * @param path The route or path
 */
const splitSegments = (path: string): string[] =>
	normalizePath(path)
		.split("/")
		.filter((segment) => !!segment);

/**
 * How specific a route's match of a path is
 * @param route The route, which matches the path
 * @param pathLength The number of segments of the path
 * @param depth The depth of the entry in the menu tree
 */
const getSpecificity = (
	route: string,
	pathLength: number,
	depth: number,
): RouteSpecificity => {
	const segments = splitSegments(route);
	const splat = segments[segments.length - 1] === "*";
	if (splat) segments.pop();
	return {
		exact: segments.length === pathLength,
		segments: segments.map((segment) =>
			segment === "*" ? 0 : segment.startsWith(":") ? 1 : 2,
		),
		splat,
		depth,
	};
};

/**
 * Orders two matches of the same path, most specific first: an exact match
 * before a prefix match, more segments first, then segment by segment from
 * the left a literal before a param before a `*`, a route without a trailing
 * `*` before one with, and a deeper entry before a shallower one
 * @return Negative when `a` is more specific, positive when `b` is, 0 on a tie
 */
const compareSpecificity = (
	a: RouteSpecificity,
	b: RouteSpecificity,
): number => {
	if (a.exact !== b.exact) return a.exact ? -1 : 1;
	if (a.segments.length !== b.segments.length)
		return b.segments.length - a.segments.length;
	for (let i = 0; i < a.segments.length; ++i) {
		if (a.segments[i] !== b.segments[i]) return b.segments[i] - a.segments[i];
	}
	if (a.splat !== b.splat) return a.splat ? 1 : -1;
	return b.depth - a.depth;
};

/**
 * The entries of the menu tree that have a route, depth first in definition
 * order, with their menu item ids
 * @param definitions The menu item definitions
 * @param groups The menu item ids of the groups above `definitions`
 * @param base What a relative route is resolved against
 * @return Each entry's id, the ids of the groups above it and the path
 * pattern of its route (resolveRoute)
 */
const flattenRoutes = (
	definitions: IRoutedMenuItemDefinition[],
	groups: string[],
	base: RouteBase,
): { id: string; groups: string[]; pattern: string }[] =>
	definitions.flatMap((def) => {
		const id = getItemId(groups[groups.length - 1] ?? null, def.title);
		return [
			...(def.route
				? [{ id, groups, pattern: resolveRoute(def.route, base).pattern }]
				: []),
			...(def.children
				? flattenRoutes(def.children, [...groups, id], base)
				: []),
		];
	});

/**
 * Percent-encodes route params for a path, so a value with "/", "?", "#" or
 * "%" stays one segment
 * @param params The params as matchPath gives them (decoded)
 */
const encodeRouteParameters = (
	params: Record<string, string>,
): Record<string, string> =>
	Object.fromEntries(
		Object.entries(params).map(([name, value]) => [
			name,
			encodeURIComponent(value),
		]),
	);

/**
 * The entry of the whole menu tree whose route matches the path best: of all
 * entries whose route matches the path as a prefix, the most specific one
 * (compareSpecificity); on a full tie the earlier one in definition order.
 * Its id is the active menu item, its groups are expanded, and its params fill
 * the routes of all entries. Entries with `shouldRender: false` take part.
 * @param definitions The menu item definitions (the top level)
 * @param path The current location.pathname
 * @param base What a relative route is resolved against
 * @return The best match, or null if no entry matches
 */
const resolveLocation = (
	definitions: IRoutedMenuItemDefinition[],
	path: string,
	base: RouteBase,
): MenuRouteMatch | null => {
	const pathLength = splitSegments(path).length;
	let best: { match: MenuRouteMatch; specificity: RouteSpecificity } | null =
		null;
	for (const entry of flattenRoutes(definitions, [], base)) {
		const match = matchPath({ path: entry.pattern, end: false }, path);
		if (!match) continue;
		const specificity = getSpecificity(
			entry.pattern,
			pathLength,
			entry.groups.length,
		);
		if (best && compareSpecificity(specificity, best.specificity) >= 0)
			continue;
		best = {
			match: {
				id: entry.id,
				groups: entry.groups,
				params: encodeRouteParameters(match.params),
			},
			specificity,
		};
	}
	return best ? best.match : null;
};

/**
 * The navigation target of an entry
 * @param definition The routed menu item definition
 * @param params The params of the current URL (resolveLocation)
 * @param base What a relative route is resolved against
 * @return The route's path with the params filled in, without a trailing
 * `/*`, below the enclosing Route's url for a relative route, and with the
 * route's search and hash; undefined for an entry without route, null when
 * `params` lacks one of the route's params
 */
const getTarget = (
	definition: IRoutedMenuItemDefinition,
	params: Record<string, string>,
	base: RouteBase,
): string | null | undefined => {
	if (!definition.route) return undefined;
	const route = resolveRoute(definition.route, base);
	const path = insertRouteParameters(route.path, params);
	if (path === null) return null;
	if (route.base === null) return path + route.suffix;
	return (path ? joinRoutePath(route.base, path) : route.base) + route.suffix;
};

/**
 * The entries hidden because the current URL cannot fill their route: only
 * entries the definition renders (`shouldRender`), and not the entries below
 * such an entry
 * @param definitions The menu item definitions
 * @param params The params of the current URL (resolveLocation)
 * @param base What a relative route is resolved against
 * @param parent The title path of the parent entry, null on the top level
 * @return Each entry's title path (`Group > Entry`), route and missing params
 */
const getUnresolvedEntries = (
	definitions: IRoutedMenuItemDefinition[],
	params: Record<string, string>,
	base: RouteBase,
	parent: string | null,
): { titlePath: string; route: string; missing: string[] }[] =>
	definitions.flatMap((def) => {
		if (!def.shouldRender) return [];
		const titlePath = parent ? `${parent} > ${def.title}` : def.title;
		const missing = def.route
			? getMissingRouteParameters(resolveRoute(def.route, base).path, params)
			: [];
		if (def.route && missing.length > 0)
			return [{ titlePath, route: def.route, missing }];
		return def.children
			? getUnresolvedEntries(def.children, params, base, titlePath)
			: [];
	});

/**
 * Converts the routed menu item definitions to normal menu item definitions
 * @param params The params of the current URL (resolveLocation)
 * @param expanded The menu item ids of the groups the current URL expands:
 * the groups above the entry of the current URL (resolveLocation). A group
 * with its own `forceExpand` is expanded too
 * @param base What a relative route is resolved against
 * @param definition The routed menu item definition
 * @param id The menu item id of the definition
 * @param navigate The react-router navigate function
 * @return a normal menu item definition
 */
const convertDefinition = (
	params: Record<string, string>,
	expanded: string[],
	base: RouteBase,
	definition: IRoutedMenuItemDefinition,
	id: string,
	navigate: NavigateFunction,
): IMenuItemDefinition => ({
	...definition,
	// an entry whose route the current URL cannot fill has nowhere to go
	shouldRender:
		definition.shouldRender && getTarget(definition, params, base) !== null,
	// the entry's own flag, and the groups above the entry of the current URL
	forceExpand:
		definition.forceExpand || (definition.children && expanded.includes(id)),
	children: definition.children?.map((entry) =>
		convertDefinition(
			params,
			expanded,
			base,
			entry,
			getItemId(id, entry.title),
			navigate,
		),
	),
	onClick: (evt) => {
		if (definition.onClick) {
			definition.onClick(evt);
		}
		// keep URL parameters
		const target = getTarget(definition, params, base);
		if (target) {
			if (evt.ctrlKey || evt.metaKey || evt.shiftKey)
				window.open(target, "_blank");
			else navigate(target);
		}
	},
	onAuxClick: (evt) => {
		// the middle button only: browsers fire auxclick for the right button too.
		// MenuBase filters as well, but useRoutedMenuLogic's handlers also go to
		// an app's own elements
		if (evt.button !== 1) return;
		if (definition.onAuxClick) {
			definition.onAuxClick(evt);
		}
		// keep URL parameters
		const target = getTarget(definition, params, base);
		if (target) window.open(target);
	},
});

/**
 * The setter of useRoutedMenuLogic's active id. MenuBase calls it with the id
 * of a clicked entry; it does nothing, because the active entry is the entry
 * of the current URL.
 */
const ignoreActiveChange: Dispatch<SetStateAction<string>> = () => undefined;

/**
 * The routing logic of RoutedMenu, for a menu the app renders itself. Must be
 * called inside a HistoryRouter; called inside a Route, the routes without a
 * leading slash are relative to that Route (see IRoutedMenuItemDefinition's
 * `route`).
 * @param props The menu definition
 * @return `definition`: the entries converted for MenuBase, with
 * `forceExpand` set on the groups above the entry of the current URL (and
 * kept on the entries that set it themselves) and handlers that navigate to
 * the entries' routes. `controlledState`: for
 * MenuBase's `customState` or a `MenuContext.Provider`, the id of the entry
 * of the current URL (the titles from the top level joined by `@`, `""` when
 * no entry matches the URL) and a setter that does nothing, because the
 * active entry follows the URL only.
 */
export const useRoutedMenuLogic = (
	props: Pick<IRoutedMenuProps, "definition">,
) => {
	const location = useLocation();
	const path = location.pathname;
	const navigate = useNavigate();
	const rawDef = props.definition;

	// the enclosing Route, which the relative routes are resolved against
	const routePrefix = useRoutePrefix();
	const routeUrl = useContext(RouteContext)?.url ?? "/";
	const base = React.useMemo(
		(): RouteBase => ({ path: routePrefix, url: routeUrl }),
		[routePrefix, routeUrl],
	);

	// the entry of the current URL: the active item, the groups to expand and
	// the params
	const current = React.useMemo(
		() => resolveLocation(rawDef, path, base),
		[rawDef, path, base],
	);

	// the active item is derived from the URL, so it is never left over from an
	// earlier path or set by a click on an entry that the URL does not match
	const activeMenuItem = current?.id ?? "";
	const controlledState = React.useMemo(
		(): [string, Dispatch<SetStateAction<string>>] => [
			activeMenuItem,
			ignoreActiveChange,
		],
		[activeMenuItem],
	);

	// convert routed menu definitions to normal menu definitions
	const params = React.useMemo(() => current?.params ?? {}, [current]);
	const definition = React.useMemo(
		() =>
			rawDef.map((entry) =>
				convertDefinition(
					params,
					current?.groups ?? [],
					base,
					entry,
					getItemId(null, entry.title),
					navigate,
				),
			),
		[rawDef, params, current, base, navigate],
	);

	// development: name the entries hidden for a param the URL lacks, once per
	// menu instance, entry and param
	const reportedParams = useRef<Set<string> | null>(null);
	useEffect(() => {
		if (process.env.NODE_ENV === "production") return;
		if (!reportedParams.current) reportedParams.current = new Set();
		const reported = reportedParams.current;
		for (const { titlePath, route, missing } of getUnresolvedEntries(
			rawDef,
			params,
			base,
			null,
		)) {
			for (const name of missing) {
				const key = [titlePath, route, name].join("\n");
				if (reported.has(key)) continue;
				reported.add(key);
				// eslint-disable-next-line no-console
				console.error(
					`RoutedMenu: the entry "${titlePath}" (route "${route}") is hidden, because the current URL "${path}" has no value for its param ":${name}" (params are read with the menu's route that matches the URL best). Set its shouldRender to false on pages without that param.`,
				);
			}
		}
	}, [rawDef, params, base, path]);
	return { definition, controlledState };
};

/**
 * A MenuBase driven by the URL: the entry whose `route` matches the current
 * path best is highlighted and the groups above it are expanded (see
 * IRoutedMenuItemDefinition's `route`; groups with `forceExpand` are
 * expanded on every page), and a click on an entry runs its
 * `onClick` and navigates to its route. The highlight follows the URL only:
 * on a path that matches no entry nothing is highlighted, and a click
 * highlights nothing by itself, only the navigation it starts does. Must be
 * rendered inside a HistoryRouter; rendered inside a Route, its routes
 * without a leading slash are relative to that Route.
 */
const RoutedMenu = (props: IRoutedMenuProps) => {
	const { definition, controlledState } = useRoutedMenuLogic(props);
	return (
		<MenuBase
			{...props}
			definition={definition}
			customState={controlledState}
		/>
	);
};

export default React.memo(RoutedMenu);
