import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { useHistoryRouterContext } from "./HistoryRouter";
import useNavigate from "./useNavigate";
/**
 * Anchor element using the history API for routing: a plain click runs the
 * `onClick` prop and is then routed, unless `onClick` prevented the default;
 * clicks with Ctrl, Meta, Shift or Alt are left to the browser. Also works as
 * the `component` of MUI's Link and ButtonBase components
 * (`<Button component={Link} to="/x">`, ListItemButton, MenuItem, Tab,
 * IconButton), which pass an `onClick` of their own.
 * @param props The props
 */
const Link = React.forwardRef(function Link(props, ref) {
    const { to, replace, state, onClick, ...anchorProps } = props;
    const { history } = useHistoryRouterContext();
    const navigate = useNavigate();
    const handleNav = useCallback((evt) => {
        onClick?.(evt);
        if (evt.defaultPrevented)
            return;
        if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey)
            return;
        evt.preventDefault();
        navigate(to, { replace, state });
    }, [navigate, onClick, replace, state, to]);
    return (_jsx("a", { ref: ref, href: history.createHref(to), onClick: handleNav, ...anchorProps }));
});
export default React.memo(Link);
