import React, {
	Dispatch,
	SetStateAction,
	useContext,
	useEffect,
	useRef,
} from "react";
import { parsePath, type History } from "history";
import {
	getMissingRouteParameters,
	insertRouteParameters,
} from "../../../utils/routeUtils";
import matchPath from "../../../standalone/Routes/matchPath";
import joinRoutePath from "../../../standalone/Routes/joinRoutePath";
import {
	compareRouteSpecificity,
	getRouteSpecificity,
	RouteSpecificity,
} from "../../../standalone/Routes/routeSpecificity";
import { RouteContext, useRoutePrefix } from "../../../standalone/Routes/Route";
import { useHistoryRouterContext } from "../../../standalone/Routes/HistoryRouter";
import toAppPath from "../../../standalone/Routes/toAppPath";
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
	 * `/devices/5/edit` (`/` matches only `/`). A home entry under a base
	 * path, such as `/tenant/abc/`, therefore matches every page below it:
	 * give it `end` to match its own path only. When several entries of the
	 * menu tree match, at any level and in any group, the most specific one is
	 * highlighted and the groups above it are expanded: an exact match before
	 * a prefix match, then the route with more segments, then, segment by
	 * segment from the left, a literal before a `:name` param (`/apps/new`
	 * before `/apps/:app`), then a route without a trailing `/*` before one
	 * with, the order by which `Routes` picks the route it renders. On a tie
	 * the deeper entry wins, then the earlier one. The highlight follows the
	 * URL only: on a path that no entry matches, nothing is highlighted, and an
	 * entry without `route` (an action such as "Log out") is never highlighted.
	 *
	 * Only an entry the menu shows is highlighted. An entry is hidden by its
	 * own `shouldRender: false`, by that of a group above it, and while the
	 * current URL has no value for one of its params (see below). On the page
	 * of a hidden entry, the most specific shown entry that matches is
	 * highlighted: "Projects" (`/projects`) on `/projects/7/capture`, the page
	 * of a hidden `/projects/:id/capture`. On a page that only hidden entries
	 * match, nothing is highlighted and no group is expanded, but the best of
	 * them is still the entry of the current URL for useRoutedMenuLogic: its
	 * active id, and `containsCurrent` on the groups above it, so a menu the
	 * app renders can mark the section the page belongs to.
	 *
	 * Its `:name` params are filled from the current URL, read with the route
	 * that matches it best as a prefix, a hidden entry's and one with `end`
	 * too: on `/projects/42/capture`,
	 * the page of a hidden `/projects/:id/capture`, `/projects/:id/review`
	 * navigates to `/projects/42/review`. The values go in percent-encoded, so
	 * a value with "/" stays one segment. While the current URL has no value
	 * for one of its params, the entry is hidden (with its children), as if
	 * `shouldRender` were false, and in development a `console.error` names
	 * the entry and the param (once per menu, entry and param). An entry meant
	 * only for pages that provide its params gets `shouldRender: false` on the
	 * other pages from the app. The part of a relative route that stands for
	 * the enclosing Route is taken from the current URL as that Route matched
	 * it.
	 *
	 * Not for a group (an entry with `children`): a group only shows and hides
	 * its entries, and its `route` is ignored. Give the group's page an entry
	 * among its children instead, e.g. "Overview" with the route `/settings`.
	 */
	route?: string;
	/**
	 * Matches `route` with the whole current path only, not as a prefix
	 *
	 * Default `false`: the entry is highlighted on its route's path and the
	 * pages below it (see `route`). With `true`, as a Route with `end`, only on
	 * its own path: `/tenant/abc/` is highlighted on `/tenant/abc` and
	 * `/tenant/abc/`, but not on `/tenant/abc/profile`. For a home entry under
	 * a base path, which every other route of the menu lies below: matched as
	 * a prefix, it is highlighted on every page below the base path that no
	 * shown entry matches more specifically. The route `/` matches only `/`
	 * either way, and a trailing `/*` still matches the rest.
	 *
	 * On a page below its route, the entry is not the entry of the current URL
	 * (neither highlighted nor `current` for useRoutedMenuLogic), but its route
	 * still reads the params of the URL for the other entries: with `end`,
	 * `/apps/:app` is not highlighted on `/apps/a1/history`, and
	 * `/apps/:app/roles` there still navigates to `/apps/a1/roles`. No effect on
	 * a group (its `route` is ignored) or on an entry without `route`.
	 */
	end?: boolean;
	/**
	 * Keeps the group expanded on every page
	 *
	 * Default `false`: RoutedMenu expands a group by itself while the
	 * highlighted entry of the current URL is inside it (not for an entry the
	 * menu hides, see `route`). With `true` the group is expanded on the
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
	 *
	 * An entry with at least one child is a group: a click, Enter or Space
	 * expands or collapses it and runs its `onClick`, and nothing else. It
	 * never navigates or opens a tab and is never the highlighted entry; its
	 * `route` is ignored. An empty array makes no group.
	 */
	children?: IRoutedMenuItemDefinition[];
}

/**
 * An entry of useRoutedMenuLogic's `definition`: the routed menu item
 * definition, converted for MenuBase, with what a menu that the app renders
 * itself needs to render the entry as a link and to mark the current page.
 * Every field of the definition is kept, `route` too (still the pattern), and
 * so are fields an app adds to IMenuItemDefinition through module
 * augmentation.
 */
export interface IRoutedMenuEntry extends Omit<
	IRoutedMenuItemDefinition,
	"onClick" | "onAuxClick" | "forceExpand" | "children"
> {
	/**
	 * Runs the definition's `onClick`, then navigates to the entry's target
	 * (`href`) in the app. Put it on the element that renders the entry.
	 *
	 * On a link (an `<a>` with `href`): a plain click is kept from loading the
	 * href as a new page and navigates in the app; a click with Ctrl, Meta,
	 * Shift or Alt is left to the browser, which opens the link in a new tab or
	 * window. On any other element (a button): a click with Ctrl, Meta or Shift
	 * opens `href` in a new tab, any other click navigates in the app. An entry
	 * without target only runs the definition's `onClick`.
	 */
	onClick: React.MouseEventHandler;
	/**
	 * For the middle button only (browsers fire `auxclick` for the right
	 * button too): runs the definition's `onAuxClick`, then, on an element
	 * other than a link, opens `href` in a new tab. A link is opened in a new
	 * tab by the browser.
	 */
	onAuxClick: React.MouseEventHandler;
	/**
	 * Keep the group expanded: `true` for the groups above the entry of the
	 * current URL (`containsCurrent`) while the menu shows that entry, and for
	 * an entry whose definition sets `forceExpand`. MenuBase keeps such a group
	 * expanded; a menu rendered by the app does the same, or ignores it for
	 * groups that open as a popup.
	 */
	forceExpand: boolean;
	/**
	 * The URL of the entry's target, as the router's history writes it
	 * (`history.createHref`): the route with its params filled in from the
	 * current URL, without a trailing `/*`, below the enclosing Route for a
	 * relative route, with the route's search and hash, e.g.
	 * `/projects/42/review`, or `#/users` with a hash history. The URL a click
	 * navigates to and a new tab opens. `undefined` for an entry without
	 * `route` (an action), for a group (its `route` is ignored) and for an
	 * entry hidden because the current URL has no value for one of its params.
	 *
	 * Render an entry with an `href` as a link (`<a href>`, or MUI's
	 * `ListItemButton`, which renders a link when it gets an `href`) with the
	 * entry's `onClick` and `onAuxClick` on it; render an entry without one as
	 * a button.
	 */
	href: string | undefined;
	/**
	 * Is this the entry of the current URL, the shown entry whose route
	 * matches it best (see IRoutedMenuItemDefinition's `route`)? Put
	 * `aria-current="page"` on its element, so screen readers announce it as
	 * the current page. A hidden entry is `true` only on a page that no shown
	 * entry matches; it is not rendered then. Always `false` for a group, and
	 * for every entry on a URL that no entry matches.
	 */
	current: boolean;
	/**
	 * Does this group contain the entry of the current URL, at any depth? For
	 * a visual mark on the groups above the current page, also when that entry
	 * is hidden (`current`). `false` for the current entry itself and for
	 * entries without children.
	 */
	containsCurrent: boolean;
	/**
	 * The entry's menu item id: its title and the titles of the groups above
	 * it, from the top level, joined by `@` ("Settings@Profile"), as MenuBase
	 * builds it and as `controlledState` holds the id of the current entry.
	 * Sibling entries with the same title share one. A stable React `key`.
	 */
	menuItemId: string;
	/**
	 * The converted children of this entry
	 */
	children?: IRoutedMenuEntry[];
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
 * The entry of the current URL (resolveLocation)
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
	 * Does the menu show the entry? false for a hidden entry, which is the
	 * entry of the current URL only while no shown entry matches; it is not
	 * highlighted and expands no group
	 */
	shown: boolean;
}

/**
 * What the menu reads from the current URL (resolveLocation)
 */
interface MenuLocation {
	/**
	 * The entry of the current URL, null when no entry matches it
	 */
	current: MenuRouteMatch | null;
	/**
	 * The params read from the path with the route of the entry that matches
	 * it best as a prefix, hidden entries and entries with `end` included,
	 * percent-encoded again to fill the routes of the entries; `{}` when no
	 * route matches
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
 * The menu item id of an entry, as MenuBase builds it
 * @param parent The menu item id of the group above the entry, null on the
 * top level
 * @param title The entry's title
 */
const getItemId = (parent: string | null, title: string): string =>
	parent ? `${parent}@${title}` : title;

/**
 * The route of an entry's page: its `route`, or none for a group (an entry
 * with children, which MenuBase renders expandable), which only shows and
 * hides its entries
 * @param definition The routed menu item definition
 * @return The route; undefined for a group and for an entry without route
 */
const getPageRoute = (
	definition: IRoutedMenuItemDefinition,
): string | undefined =>
	definition.children && definition.children.length > 0
		? undefined
		: definition.route;

/**
 * An entry of the menu tree that has a page route (flattenRoutes)
 */
interface RoutedEntry {
	/**
	 * The entry's menu item id
	 */
	id: string;
	/**
	 * The menu item ids of the groups above the entry, outermost first
	 */
	groups: string[];
	/**
	 * Does MenuBase render the entry: `shouldRender` of the entry and of every
	 * group above it?
	 */
	rendered: boolean;
	/**
	 * The entry's route, read by resolveRoute
	 */
	route: ResolvedRoute;
	/**
	 * The definition's `end`: the entry is the entry of its route's own path
	 * only
	 */
	end: boolean;
}

/**
 * The entries of the menu tree that have a page route (getPageRoute), depth
 * first in definition order, with their menu item ids
 * @param definitions The menu item definitions
 * @param groups The menu item ids of the groups above `definitions`
 * @param rendered Are the groups above `definitions` rendered?
 * @param base What a relative route is resolved against
 * @return The entries, see RoutedEntry
 */
const flattenRoutes = (
	definitions: IRoutedMenuItemDefinition[],
	groups: string[],
	rendered: boolean,
	base: RouteBase,
): RoutedEntry[] =>
	definitions.flatMap((def) => {
		const id = getItemId(groups[groups.length - 1] ?? null, def.title);
		const route = getPageRoute(def);
		const entryRendered = rendered && def.shouldRender;
		return [
			...(route
				? [
						{
							id,
							groups,
							rendered: entryRendered,
							route: resolveRoute(route, base),
							end: !!def.end,
						},
					]
				: []),
			...(def.children
				? flattenRoutes(def.children, [...groups, id], entryRendered, base)
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
 * An entry whose route matches the current path (resolveLocation)
 */
interface RouteCandidate {
	/**
	 * The entry
	 */
	entry: RoutedEntry;
	/**
	 * The params read from the path with the entry's route (decoded)
	 */
	params: Record<string, string>;
	/**
	 * How specific the entry's route is (getRouteSpecificity)
	 */
	specificity: RouteSpecificity;
}

/**
 * The candidate whose route matches the path best: the most specific one
 * (compareRouteSpecificity), of equally specific ones the deepest in the menu
 * tree; on a full tie the earlier one in definition order
 * @param candidates The entries whose route matches the path, in definition
 * order
 * @return The best one, or null for no candidates
 */
const getBestCandidate = (
	candidates: RouteCandidate[],
): RouteCandidate | null =>
	candidates.reduce<RouteCandidate | null>(
		(best, candidate) =>
			best &&
			(compareRouteSpecificity(candidate.specificity, best.specificity) ||
				best.entry.groups.length - candidate.entry.groups.length) >= 0
				? best
				: candidate,
		null,
	);

/**
 * The entry of the current URL and the params of the URL. Of all entries
 * whose route matches the path as a prefix (getBestCandidate ranks them):
 * - the best one, hidden entries and entries with `end` included, provides
 *   the params that fill the routes of all entries;
 * - the best one the menu shows is the entry of the current URL: highlighted,
 *   and the groups above it are expanded. An entry is shown when it and every
 *   group above it have `shouldRender` and the params can fill its route.
 * When no shown entry matches, the best hidden one is the entry of the current
 * URL: the active id, and the groups above it contain it, but it is not
 * rendered and expands no group (`shown: false`). An entry with `end` is the
 * entry of the current URL only where its route matches the whole path.
 * @param definitions The menu item definitions (the top level)
 * @param path The current location.pathname
 * @param base What a relative route is resolved against
 * @return The entry of the current URL (null if no entry matches) and the
 * params
 */
const resolveLocation = (
	definitions: IRoutedMenuItemDefinition[],
	path: string,
	base: RouteBase,
): MenuLocation => {
	const candidates = flattenRoutes(definitions, [], true, base).flatMap(
		(entry): RouteCandidate[] => {
			const match = matchPath({ path: entry.route.pattern, end: false }, path);
			return match
				? [
						{
							entry,
							params: match.params,
							specificity: getRouteSpecificity(entry.route.pattern),
						},
					]
				: [];
		},
	);
	const best = getBestCandidate(candidates);
	const params = best ? encodeRouteParameters(best.params) : {};
	// an entry with `end` is the entry of its own path only
	const eligible = candidates.filter(
		({ entry }) =>
			!entry.end || !!matchPath({ path: entry.route.pattern, end: true }, path),
	);
	const bestShown = getBestCandidate(
		eligible.filter(
			({ entry }) =>
				entry.rendered &&
				getMissingRouteParameters(entry.route.path, params).length === 0,
		),
	);
	const current = bestShown ?? getBestCandidate(eligible);
	return {
		current: current
			? {
					id: current.entry.id,
					groups: current.entry.groups,
					shown: !!bestShown,
				}
			: null,
		params,
	};
};

/**
 * The navigation target of an entry
 * @param definition The routed menu item definition
 * @param params The params of the current URL (resolveLocation)
 * @param base What a relative route is resolved against
 * @return The route's path with the params filled in, without a trailing
 * `/*`, below the enclosing Route's url for a relative route, and with the
 * route's search and hash; undefined for an entry without route and for a
 * group, null when `params` lacks one of the route's params
 */
const getTarget = (
	definition: IRoutedMenuItemDefinition,
	params: Record<string, string>,
	base: RouteBase,
): string | null | undefined => {
	const pageRoute = getPageRoute(definition);
	if (!pageRoute) return undefined;
	const route = resolveRoute(pageRoute, base);
	const path = insertRouteParameters(route.path, params);
	if (path === null) return null;
	if (route.base === null) return path + route.suffix;
	return (path ? joinRoutePath(route.base, path) : route.base) + route.suffix;
};

/**
 * The URL that a new tab opens for an entry: the URL a plain click on it
 * navigates to. The target goes to the history as useNavigate hands it over,
 * its leading slashes collapsed into one, and the history writes it as a URL,
 * e.g. "#/users" for a hash history (a new tab at "/users" would be outside
 * of the app).
 * @param history The router's history
 * @param target The entry's navigation target (getTarget)
 * @return The href, or null for a target that is no path of the app, which
 * useNavigate refuses too
 */
const getTargetHref = (history: History, target: string): string | null => {
	const path = toAppPath(target);
	return path === null ? null : history.createHref(path);
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
		const route = getPageRoute(def);
		const missing = route
			? getMissingRouteParameters(resolveRoute(route, base).path, params)
			: [];
		if (route && missing.length > 0) return [{ titlePath, route, missing }];
		return def.children
			? getUnresolvedEntries(def.children, params, base, titlePath)
			: [];
	});

/**
 * Is the element a link that the browser follows by itself, an `<a>` with an
 * `href`? A menu rendered by the app may put an entry's handlers on one: the
 * browser then opens the new tab for a modified or middle click, and a plain
 * click must not load the href as a new page.
 * @param element The element the handler runs on (the event's
 * currentTarget; missing on an event an app makes up)
 */
const isLink = (element: EventTarget | null | undefined): boolean =>
	element instanceof HTMLAnchorElement && element.hasAttribute("href");

/**
 * What the conversion reads for every entry of the menu
 */
interface ConversionContext {
	/**
	 * The entry of the current URL (resolveLocation), null when no entry
	 * matches
	 */
	current: MenuRouteMatch | null;
	/**
	 * The params of the current URL (resolveLocation)
	 */
	params: Record<string, string>;
	/**
	 * What a relative route is resolved against
	 */
	base: RouteBase;
	/**
	 * The navigate function of the HistoryRouter
	 */
	navigate: NavigateFunction;
	/**
	 * The router's history, which writes the URL of a target
	 */
	history: History;
}

/**
 * Converts a routed menu item definition to an entry for MenuBase or a menu
 * rendered by the app
 * @param context The current URL's entry and params, and the router
 * @param definition The routed menu item definition
 * @param id The menu item id of the definition
 * @return The entry, see IRoutedMenuEntry
 */
const convertDefinition = (
	context: ConversionContext,
	definition: IRoutedMenuItemDefinition,
	id: string,
): IRoutedMenuEntry => {
	const { current, params, base, navigate, history } = context;
	// keep URL parameters
	const target = getTarget(definition, params, base);
	const href = target
		? (getTargetHref(history, target) ?? undefined)
		: undefined;
	const containsCurrent =
		!!definition.children && !!current?.groups.includes(id);
	return {
		...definition,
		// an entry whose route the current URL cannot fill has nowhere to go
		shouldRender: definition.shouldRender && target !== null,
		// the entry's own flag, and the groups above the entry of the current URL
		// while the menu shows it: a hidden entry has nothing to keep in view
		forceExpand:
			!!definition.forceExpand || (containsCurrent && !!current?.shown),
		href,
		current: current?.id === id,
		containsCurrent,
		menuItemId: id,
		children: definition.children?.map((entry) =>
			convertDefinition(context, entry, getItemId(id, entry.title)),
		),
		onClick: (evt) => {
			if (definition.onClick) {
				definition.onClick(evt);
			}
			if (!target) return;
			if (isLink(evt.currentTarget)) {
				// the browser opens a new tab or window for a modified click
				if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey) return;
				evt.preventDefault();
				navigate(target);
			} else if (evt.ctrlKey || evt.metaKey || evt.shiftKey) {
				if (href) window.open(href, "_blank");
			} else navigate(target);
		},
		onAuxClick: (evt) => {
			// the middle button only: browsers fire auxclick for the right button
			// too. MenuBase filters as well, but useRoutedMenuLogic's handlers also
			// go to an app's own elements
			if (evt.button !== 1) return;
			if (definition.onAuxClick) {
				definition.onAuxClick(evt);
			}
			// the browser opens a link in a new tab itself
			if (href && !isLink(evt.currentTarget)) window.open(href);
		},
	};
};

/**
 * The setter of useRoutedMenuLogic's active id. MenuBase calls it with the id
 * of a clicked entry; it does nothing, because the active entry is the entry
 * of the current URL.
 */
const ignoreActiveChange: Dispatch<SetStateAction<string>> = () => undefined;

/**
 * What useRoutedMenuLogic returns
 */
export interface UseRoutedMenuLogicResult {
	/**
	 * The entries converted for MenuBase's `definition` or for a menu rendered
	 * by the app, in definition order: each with handlers that navigate to its
	 * route, the URL of that route (`href`), whether it is the entry of the
	 * current URL (`current`) or a group above it (`containsCurrent`, which
	 * also sets `forceExpand`), and its menu item id. See IRoutedMenuEntry.
	 */
	definition: IRoutedMenuEntry[];
	/**
	 * For MenuBase's `customState` or a `MenuContext.Provider`: the menu item
	 * id of the entry of the current URL (see IRoutedMenuEntry's `current`;
	 * `""` when no entry matches the URL) and a setter that does nothing,
	 * because the active entry follows the URL only
	 */
	controlledState: [string, Dispatch<SetStateAction<string>>];
}

/**
 * The routing logic of RoutedMenu, for a menu the app renders itself. Must be
 * called inside a HistoryRouter; called inside a Route, the routes without a
 * leading slash are relative to that Route (see IRoutedMenuItemDefinition's
 * `route`).
 *
 * Render each entry of `definition` with `shouldRender` (an entry the
 * current URL cannot fill the params of has it `false`):
 * - with an `href` as a link: `href`, `onClick` and `onAuxClick` on an `<a>`
 *   (or on MUI's `ListItemButton`, which then renders one), and
 *   `aria-current="page"` while it is `current`. A plain click navigates in
 *   the app, and the browser offers what it offers for any link: open it in a
 *   new tab with a modified or middle click, copy its address.
 * - without `href` (an action) as a button with its `onClick`.
 * - a group as a button that shows and hides its children, with
 *   `aria-expanded` from the menu's own state, kept expanded while
 *   `forceExpand` is set.
 *
 * Entries rendered as buttons that call `onClick` work too: a Ctrl, Meta or
 * Shift click and a middle click open `href` in a new tab.
 * @param props The menu definition; keep it referentially stable, the
 * entries are converted again whenever it changes
 * @return The converted entries and the menu state, see
 * UseRoutedMenuLogicResult
 */
export const useRoutedMenuLogic = (
	props: Pick<IRoutedMenuProps, "definition">,
): UseRoutedMenuLogicResult => {
	const location = useLocation();
	const path = location.pathname;
	const navigate = useNavigate();
	const { history } = useHistoryRouterContext();
	const rawDef = props.definition;

	// the enclosing Route, which the relative routes are resolved against
	const routePrefix = useRoutePrefix();
	const routeUrl = useContext(RouteContext)?.url ?? "/";
	const base = React.useMemo(
		(): RouteBase => ({ path: routePrefix, url: routeUrl }),
		[routePrefix, routeUrl],
	);

	// the entry of the current URL (the active item and the groups to expand)
	// and the params
	const { current, params } = React.useMemo(
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
	const definition = React.useMemo(() => {
		const context: ConversionContext = {
			current,
			params,
			base,
			navigate,
			history,
		};
		return rawDef.map((entry) =>
			convertDefinition(context, entry, getItemId(null, entry.title)),
		);
	}, [rawDef, params, current, base, navigate, history]);

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
 * A MenuBase driven by the URL: the shown entry whose `route` matches the
 * current path best is highlighted and the groups above it are expanded (see
 * IRoutedMenuItemDefinition's `route`; groups with `forceExpand` are
 * expanded on every page), and a click on an entry runs its
 * `onClick` and navigates to its route. A click on a group only expands or
 * collapses it (and runs its `onClick`): a group has no page of its own, its
 * `route` is ignored. A Ctrl, Meta or Shift click and a
 * middle click open the URL of that navigation in a new tab instead, as the
 * history writes it (`#/users` with a hash history). The highlight follows
 * the URL only: on a path that matches no entry nothing is highlighted, and
 * a click highlights nothing by itself, only the navigation it starts does.
 * Must be rendered inside a HistoryRouter; rendered inside a Route, its
 * routes without a leading slash are relative to that Route.
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
