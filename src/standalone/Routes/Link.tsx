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
}

/**
 * anchor element using history API for routing
 * @param props The props
 */
const Link = React.forwardRef(function Link(
	props: LinkProps,
	ref: React.ForwardedRef<HTMLAnchorElement>,
) {
	const { to, replace, state, ...anchorProps } = props;
	const { history } = useHistoryRouterContext();
	const navigate = useNavigate();
	const handleNav = useCallback(
		(evt: React.MouseEvent) => {
			if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey) return;
			evt.preventDefault();
			navigate(to, { replace, state });
		},
		[navigate, replace, state, to],
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
