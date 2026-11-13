import React, { useEffect, useRef, useState } from "react";
import {
	getMissingRouteParameters,
	insertRouteParameters,
} from "../../../utils/routeUtils";
import matchPath, { normalizePath } from "../../../standalone/Routes/matchPath";
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
	 * The route also decides when the entry is highlighted. It matches the
	 * current URL as a prefix: `/devices` matches `/devices/5/edit` (`/`
	 * matches only `/`). When several entries of the menu tree match, at any
	 * level and in any group, the most specific one is highlighted and the
	 * groups above it are expanded: an exact match before a prefix match, then
	 * the route with more segments, then, segment by segment from the left, a
	 * literal before a `:name` param (`/apps/new` before `/apps/:app`). On a
	 * tie the deeper entry wins (a group's entry with the group's own route),
	 * then the earlier one.
	 *
	 * Its `:name` params are filled from the current URL, read with the route
	 * of that best-matching entry: on `/projects/42/review`,
	 * `/projects/:id/capture` navigates to `/projects/42/capture`. While the
	 * current URL has no value for one of its params, the entry is hidden
	 * (with its children), as if `shouldRender` were false, and in development
	 * a `console.error` names the entry and the param (once per menu, entry
	 * and param). An entry meant only for pages that provide its params gets
	 * `shouldRender: false` on the other pages from the app.
	 */
	route?: string;
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
	 * The params read from the path with the entry's route
	 */
	params: Record<string, string>;
}

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
 */
const flattenRoutes = (
	definitions: IRoutedMenuItemDefinition[],
	groups: string[],
): { id: string; groups: string[]; route: string }[] =>
	definitions.flatMap((def) => {
		const id = getItemId(groups[groups.length - 1] ?? null, def.title);
		return [
			...(def.route ? [{ id, groups, route: def.route }] : []),
			...(def.children ? flattenRoutes(def.children, [...groups, id]) : []),
		];
	});

/**
 * The entry of the whole menu tree whose route matches the path best: of all
 * entries whose route matches the path as a prefix, the most specific one
 * (compareSpecificity); on a full tie the earlier one in definition order.
 * Its id is the active menu item, its groups are expanded, and its params fill
 * the routes of all entries. Entries with `shouldRender: false` take part.
 * @param definitions The menu item definitions (the top level)
 * @param path The current location.pathname
 * @return The best match, or null if no entry matches
 */
const resolveLocation = (
	definitions: IRoutedMenuItemDefinition[],
	path: string,
): MenuRouteMatch | null => {
	const pathLength = splitSegments(path).length;
	let best: { match: MenuRouteMatch; specificity: RouteSpecificity } | null =
		null;
	for (const entry of flattenRoutes(definitions, [])) {
		const match = matchPath({ path: entry.route, end: false }, path);
		if (!match) continue;
		const specificity = getSpecificity(
			entry.route,
			pathLength,
			entry.groups.length,
		);
		if (best && compareSpecificity(specificity, best.specificity) >= 0)
			continue;
		best = {
			match: { id: entry.id, groups: entry.groups, params: match.params },
			specificity,
		};
	}
	return best ? best.match : null;
};

/**
 * The navigation target of an entry
 * @param definition The routed menu item definition
 * @param params The params of the current URL (resolveLocation)
 * @return The route with the params filled in; undefined for an entry without
 * route, null when `params` lacks one of the route's params
 */
const getTarget = (
	definition: IRoutedMenuItemDefinition,
	params: Record<string, string>,
): string | null | undefined =>
	definition.route
		? insertRouteParameters(definition.route, params)
		: undefined;

/**
 * The entries hidden because the current URL cannot fill their route: only
 * entries the definition renders (`shouldRender`), and not the entries below
 * such an entry
 * @param definitions The menu item definitions
 * @param params The params of the current URL (resolveLocation)
 * @param parent The title path of the parent entry, null on the top level
 * @return Each entry's title path (`Group > Entry`), route and missing params
 */
const getUnresolvedEntries = (
	definitions: IRoutedMenuItemDefinition[],
	params: Record<string, string>,
	parent: string | null,
): { titlePath: string; route: string; missing: string[] }[] =>
	definitions.flatMap((def) => {
		if (!def.shouldRender) return [];
		const titlePath = parent ? `${parent} > ${def.title}` : def.title;
		const missing = def.route
			? getMissingRouteParameters(def.route, params)
			: [];
		if (def.route && missing.length > 0)
			return [{ titlePath, route: def.route, missing }];
		return def.children
			? getUnresolvedEntries(def.children, params, titlePath)
			: [];
	});

/**
 * Converts the routed menu item definitions to normal menu item definitions
 * @param params The params of the current URL (resolveLocation)
 * @param expanded The menu item ids of the groups to expand: the groups above
 * the entry of the current URL (resolveLocation)
 * @param definition The routed menu item definition
 * @param id The menu item id of the definition
 * @param navigate The react-router navigate function
 * @return a normal menu item definition
 */
const convertDefinition = (
	params: Record<string, string>,
	expanded: string[],
	definition: IRoutedMenuItemDefinition,
	id: string,
	navigate: NavigateFunction,
): IMenuItemDefinition => ({
	...definition,
	// an entry whose route the current URL cannot fill has nowhere to go
	shouldRender:
		definition.shouldRender && getTarget(definition, params) !== null,
	forceExpand: definition.children && expanded.includes(id),
	children: definition.children?.map((entry) =>
		convertDefinition(
			params,
			expanded,
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
		const target = getTarget(definition, params);
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
		const target = getTarget(definition, params);
		if (target) window.open(target);
	},
});

export const useRoutedMenuLogic = (
	props: Pick<IRoutedMenuProps, "definition">,
) => {
	const controlledState = useState("");
	const [activeMenuItem, setActiveMenuItem] = controlledState;
	const location = useLocation();
	const path = location.pathname;
	const navigate = useNavigate();
	const rawDef = props.definition;

	// the entry of the current URL: the active item, the groups to expand and
	// the params
	const current = React.useMemo(
		() => resolveLocation(rawDef, path),
		[rawDef, path],
	);

	// set the currently active item based off location
	useEffect(() => {
		const menuEntry = current?.id;
		if (menuEntry && activeMenuItem !== menuEntry) {
			setActiveMenuItem(menuEntry);
		}
	}, [activeMenuItem, current, setActiveMenuItem]);

	// convert routed menu definitions to normal menu definitions
	const params = React.useMemo(() => current?.params ?? {}, [current]);
	const definition = React.useMemo(
		() =>
			rawDef.map((entry) =>
				convertDefinition(
					params,
					current?.groups ?? [],
					entry,
					getItemId(null, entry.title),
					navigate,
				),
			),
		[rawDef, params, current, navigate],
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
	}, [rawDef, params, path]);
	return { definition, controlledState };
};

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
