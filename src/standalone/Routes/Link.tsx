import React, { useCallback, useMemo } from "react";
import {
	createPath,
	parsePath,
	type History,
	type Location,
	type To,
} from "history";
import { useHistoryRouterContext } from "./HistoryRouter";
import useNavigate from "./useNavigate";
import useLocation from "./useLocation";
import toAppPath from "./toAppPath";

export interface LinkProps extends Omit<
	React.DetailedHTMLProps<
		React.AnchorHTMLAttributes<HTMLAnchorElement>,
		HTMLAnchorElement
	>,
	"href"
> {
	/**
	 * Target location: a path of the app or a location object. Leading slashes
	 * collapse into one, as with `useNavigate`: "//7" links to "/7".
	 * A target that leaves out `pathname` (a location object, or a string such
	 * as "?page=2") keeps the current one; a target that leaves out `search` or
	 * `hash` drops them, as a push does: at "/devices?page=1",
	 * `{ search: "?page=2" }` and "?page=2" link to "/devices?page=2", and
	 * `{ hash: "#notes" }` and "#notes" to "/devices#notes".
	 * A URL with a scheme ("https://…", "mailto:…") makes a plain link that
	 * the browser follows; `replace` and `state` don't apply to it.
	 */
	to: To;
	/**
	 * Replace the current history entry?
	 */
	replace?: boolean;
	/**
	 * Target location state (passed to history API)
	 */
	state?: unknown;
	/**
	 * Where the browser opens the link. A target other than `_self`
	 * (`_blank`, a window name) leaves a click to the browser, which opens the
	 * href there; `replace` and `state` don't apply. An empty target or
	 * `_self` routes as usual. Default: none (the current tab)
	 */
	target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
	/**
	 * Downloads the href instead of opening it: `true`, or the file name to
	 * save it as. A click is then left to the browser, which downloads it.
	 * Default: none (no download)
	 */
	download?: React.AnchorHTMLAttributes<HTMLAnchorElement>["download"];
	/**
	 * Called on every click, also with Ctrl, Meta, Shift or Alt, before the
	 * link handles it. Calling `evt.preventDefault()` keeps the link from
	 * navigating, e.g. to open a dialog instead; skip that for a click with a
	 * modifier key to let Ctrl-click still open the href in a new tab.
	 */
	onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/**
 * The href a click navigates to. A target that leaves out `pathname`, `search`
 * or `hash` is completed from the current location the way `history.push`
 * completes it: a missing pathname stays the current one, a missing search and
 * hash become empty. `history.createHref` alone fills a missing pathname with
 * "/".
 * @param history The router's history
 * @param location The current location
 * @param to The target, with leading slashes already collapsed
 * @returns The href for the target
 */
const navigationHref = (history: History, location: Location, to: To): string =>
	history.createHref({
		pathname: location.pathname,
		search: "",
		hash: "",
		...(typeof to === "string" ? parsePath(to) : to),
	});

/**
 * Does the browser open the link in another tab or window, or download it?
 * A target that is empty or "_self" (in any case) is the current tab, as in
 * the HTML standard.
 * @param anchor The clicked link
 */
const opensElsewhere = (anchor: HTMLAnchorElement): boolean => {
	if (anchor.hasAttribute("download")) return true;
	const target = anchor.getAttribute("target");
	return !!target && target.toLowerCase() !== "_self";
};

/**
 * Anchor element using the history API for routing: a plain click runs the
 * `onClick` prop and is then routed, unless `onClick` prevented the default.
 * Clicks with Ctrl, Meta, Shift or Alt are left to the browser, and so is
 * every click on a link with a `target` other than `_self` or with
 * `download`. Also works as the `component` of MUI's Link and ButtonBase
 * components (`<Button component={Link} to="/x">`, ListItemButton, MenuItem,
 * Tab, IconButton), which pass an `onClick` of their own.
 * @param props The props
 */
const Link = React.forwardRef(function Link(
	props: LinkProps,
	ref: React.ForwardedRef<HTMLAnchorElement>,
) {
	const { to, replace, state, onClick, ...anchorProps } = props;
	const { history } = useHistoryRouterContext();
	const location = useLocation();
	const navigate = useNavigate();
	// null for a URL with a scheme, which the browser follows
	const target = useMemo(() => toAppPath(to), [to]);
	// the current location completes a target without pathname, search or hash
	const href = useMemo(
		() =>
			target
				? navigationHref(history, location, target)
				: typeof to === "string"
					? to
					: createPath(to),
		[history, location, target, to],
	);
	const handleNav = useCallback(
		(evt: React.MouseEvent<HTMLAnchorElement>) => {
			onClick?.(evt);
			if (evt.defaultPrevented) return;
			if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey) return;
			if (opensElsewhere(evt.currentTarget)) return;
			if (!target) return;
			evt.preventDefault();
			navigate(target, { replace, state });
		},
		[navigate, onClick, replace, state, target],
	);
	return <a ref={ref} href={href} onClick={handleNav} {...anchorProps} />;
});

export default React.memo(Link);
