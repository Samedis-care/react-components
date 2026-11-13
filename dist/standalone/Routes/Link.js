import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { createPath } from "history";
import { useHistoryRouterContext } from "./HistoryRouter";
import useNavigate from "./useNavigate";
import toAppPath from "./toAppPath";
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
    // null for a URL with a scheme, which the browser follows
    const target = useMemo(() => toAppPath(to), [to]);
    const handleNav = useCallback((evt) => {
        onClick?.(evt);
        if (evt.defaultPrevented)
            return;
        if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey)
            return;
        if (!target)
            return;
        evt.preventDefault();
        navigate(target, { replace, state });
    }, [navigate, onClick, replace, state, target]);
    return (_jsx("a", { ref: ref, href: target
            ? history.createHref(target)
            : typeof to === "string"
                ? to
                : createPath(to), onClick: handleNav, ...anchorProps }));
});
export default React.memo(Link);
