import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { createPath, parsePath, } from "history";
import { useHistoryRouterContext } from "./HistoryRouter";
import useNavigate from "./useNavigate";
import useLocation from "./useLocation";
import toAppPath from "./toAppPath";
/**
 * The location a click navigates to. A target that leaves out `pathname`,
 * `search` or `hash` is completed from the current location the way
 * `history.push` completes it: a missing pathname stays the current one, a
 * missing search and hash become empty.
 * @param location The current location
 * @param to The target, with leading slashes already collapsed
 * @returns The completed target
 */
const navigationTarget = (location, to) => ({
    pathname: location.pathname,
    search: "",
    hash: "",
    ...(typeof to === "string" ? parsePath(to) : to),
});
/**
 * The href a click navigates to, see {@link navigationTarget}.
 * `history.createHref` alone fills a missing pathname with "/".
 * @param history The router's history
 * @param location The current location
 * @param to The target, with leading slashes already collapsed
 * @returns The href for the target
 */
const navigationHref = (history, location, to) => history.createHref(navigationTarget(location, to));
/**
 * A path as the URL parser reads it, percent-encoded: a browser history keeps
 * the location encoded ("/%C3%BCber"), a memory history as it was pushed
 * ("/über"). The path goes after a fixed origin and a slash, so no part of it
 * is read as a host.
 * @param path A path, with search and hash
 * @returns The URL of the path
 */
const normalizedUrl = (path) => new URL(`http://localhost/${createPath(path)}`).href;
/**
 * Does a click on the target stay at the current location? Pathname, search
 * and hash are compared as the URL parser reads them, so "/über" is the
 * current location at "/%C3%BCber"; the state is not compared.
 * @param location The current location
 * @param to The target, with leading slashes already collapsed
 */
const isCurrentLocation = (location, to) => normalizedUrl(navigationTarget(location, to)) === normalizedUrl(location);
/**
 * Does the browser open the link in another tab or window, or download it?
 * A target that is empty or "_self" (in any case) is the current tab, as in
 * the HTML standard.
 * @param anchor The clicked link
 */
const opensElsewhere = (anchor) => {
    if (anchor.hasAttribute("download"))
        return true;
    const target = anchor.getAttribute("target");
    return !!target && target.toLowerCase() !== "_self";
};
/**
 * Anchor element using the history API for routing: a plain click runs the
 * `onClick` prop and is then routed, unless `onClick` prevented the default.
 * A click on a link to the current location replaces the history entry instead
 * of pushing a second one, as the browser does for a plain `<a>` and as
 * react-router's Link does (see `replace`). Clicks with Ctrl, Meta, Shift or
 * Alt are left to the browser, and so is every click on a link with a
 * `target` other than `_self` or with `download`. Also works as the
 * `component` of MUI's Link and ButtonBase components
 * (`<Button component={Link} to="/x">`, ListItemButton, MenuItem, Tab,
 * IconButton), which pass an `onClick` of their own.
 * @param props The props
 */
const Link = React.forwardRef(function Link(props, ref) {
    const { to, replace, state, onClick, ...anchorProps } = props;
    const { history } = useHistoryRouterContext();
    const location = useLocation();
    const navigate = useNavigate();
    // null for a URL with a scheme, which the browser follows
    const target = useMemo(() => toAppPath(to), [to]);
    // the current location completes a target without pathname, search or hash
    const href = useMemo(() => target
        ? navigationHref(history, location, target)
        : typeof to === "string"
            ? to
            : createPath(to), [history, location, target, to]);
    const handleNav = useCallback((evt) => {
        onClick?.(evt);
        if (evt.defaultPrevented)
            return;
        if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey)
            return;
        if (opensElsewhere(evt.currentTarget))
            return;
        if (!target)
            return;
        evt.preventDefault();
        navigate(target, {
            // history.location: the one the push completes the target from
            replace: replace ?? isCurrentLocation(history.location, target),
            state,
        });
    }, [history, navigate, onClick, replace, state, target]);
    return _jsx("a", { ref: ref, href: href, onClick: handleNav, ...anchorProps });
});
export default React.memo(Link);
