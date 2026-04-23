import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { useHistoryRouterContext } from "./HistoryRouter";
import useNavigate from "./useNavigate";
/**
 * anchor element using history API for routing
 * @param props The props
 */
const Link = React.forwardRef(function Link(props, ref) {
    const { to, replace, state, ...anchorProps } = props;
    const { history } = useHistoryRouterContext();
    const navigate = useNavigate();
    const handleNav = useCallback((evt) => {
        if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey)
            return;
        evt.preventDefault();
        navigate(to, { replace, state });
    }, [navigate, replace, state, to]);
    return (_jsx("a", { ref: ref, href: history.createHref(to), onClick: handleNav, ...anchorProps }));
});
export default React.memo(Link);
