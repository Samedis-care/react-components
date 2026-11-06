import React, { useCallback } from "react";
import type { To } from "history";
import { useHistoryRouterContext } from "./HistoryRouter";
import useNavigate from "./useNavigate";

export interface LinkProps extends Omit<
	React.DetailedHTMLProps<
		React.AnchorHTMLAttributes<HTMLAnchorElement>,
		HTMLAnchorElement
	>,
	"href"
> {
	/**
	 * Target location
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
	const handleNav = useCallback(
		(evt: React.MouseEvent<HTMLAnchorElement>) => {
			onClick?.(evt);
			if (evt.defaultPrevented) return;
			if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey) return;
			evt.preventDefault();
			navigate(to, { replace, state });
		},
		[navigate, onClick, replace, state, to],
	);
	return (
		<a
			ref={ref}
			href={history.createHref(to)}
			onClick={handleNav}
			{...anchorProps}
		/>
	);
});

export default React.memo(Link);
