import React, { useCallback, useMemo } from "react";
import { createPath, type To } from "history";
import { useHistoryRouterContext } from "./HistoryRouter";
import useNavigate from "./useNavigate";
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
	 * Called on every click, also with Ctrl, Meta, Shift or Alt, before the
	 * link handles it. Calling `evt.preventDefault()` keeps the link from
	 * navigating, e.g. to open a dialog instead; skip that for a click with a
	 * modifier key to let Ctrl-click still open the href in a new tab.
	 */
	onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/**
 * Anchor element using the history API for routing: a plain click runs the
 * `onClick` prop and is then routed, unless `onClick` prevented the default;
 * clicks with Ctrl, Meta, Shift or Alt are left to the browser. Also works as
 * the `component` of MUI's Link and ButtonBase components
 * (`<Button component={Link} to="/x">`, ListItemButton, MenuItem, Tab,
 * IconButton), which pass an `onClick` of their own.
 * @param props The props
 */
const Link = React.forwardRef(function Link(
	props: LinkProps,
	ref: React.ForwardedRef<HTMLAnchorElement>,
) {
	const { to, replace, state, onClick, ...anchorProps } = props;
	const { history } = useHistoryRouterContext();
	const navigate = useNavigate();
	// null for a URL with a scheme, which the browser follows
	const target = useMemo(() => toAppPath(to), [to]);
	const handleNav = useCallback(
		(evt: React.MouseEvent<HTMLAnchorElement>) => {
			onClick?.(evt);
			if (evt.defaultPrevented) return;
			if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey) return;
			if (!target) return;
			evt.preventDefault();
			navigate(target, { replace, state });
		},
		[navigate, onClick, replace, state, target],
	);
	return (
		<a
			ref={ref}
			href={
				target
					? history.createHref(target)
					: typeof to === "string"
						? to
						: createPath(to)
			}
			onClick={handleNav}
			{...anchorProps}
		/>
	);
});

export default React.memo(Link);
