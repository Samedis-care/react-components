import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { createPath, parsePath, } from "history";
import { useHistoryRouterContext } from "./HistoryRouter";
import useNavigate from "./useNavigate";
import useLocation from "./useLocation";
import toAppPath from "./toAppPath";
import { isCurrentLocation, navigationTarget, normalizedUrl, } from "./navigationTarget";
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
 * Does the link lead to the current page, for `markCurrent`? The location has
 * the target's pathname, the search params the target names (each with the
 * same value) and the hash the target names, if it names one. Compared as
 * the URL parser reads them, as in {@link isCurrentLocation}.
 * @param location The current location
 * @param to The target, with leading slashes already collapsed
 */
const leadsToCurrentPage = (location, to) => {
    const named = typeof to === "string" ? parsePath(to) : to;
    const target = new URL(normalizedUrl(navigationTarget(location, to)));
    const current = new URL(normalizedUrl(location));
    if (target.pathname !== current.pathname)
        return false;
    if (named.hash && target.hash !== current.hash)
        return false;
    for (const [name, value] of target.searchParams)
        if (!current.searchParams.getAll(name).includes(value))
            return false;
    return true;
};
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
 * `target` other than `_self` or with `download`. A link to a hash, such as
 * the skip link `to="#main"`, scrolls the element with that id into view and
 * moves the focus to it, as a plain `<a href="#main">` does. With
 * `markCurrent`, the link to the current page gets `aria-current="page"`.
 * Also works as the `component` of MUI's Link and ButtonBase components
 * (`<Button component={Link} to="/x">`, ListItemButton, MenuItem, Tab,
 * IconButton), which pass an `onClick` of their own.
 * @param props The props
 */
const Link = React.forwardRef(function Link(props, ref) {
    const { to, replace, state, preventScrollReset, onClick, markCurrent, "aria-current": ariaCurrent, ...anchorProps } = props;
    const { history } = useHistoryRouterContext();
    const location = useLocation();
    const navigate = useNavigate();
    // null for a URL with a scheme, which the browser follows
    const target = useMemo(() => toAppPath(to), [to]);
    // the aria-current token of the link to the current page
    const currentToken = markCurrent === true ? "page" : markCurrent || undefined;
    const isCurrent = useMemo(() => !!currentToken && target !== null && leadsToCurrentPage(location, target), [currentToken, location, target]);
    // the current location completes a target without pathname, search or hash
    const href = useMemo(() => target !== null
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
        if (target === null)
            return;
        evt.preventDefault();
        navigate(target, {
            // history.location: the one the push completes the target from
            replace: replace ?? isCurrentLocation(history.location, target),
            state,
            preventScrollReset,
        });
    }, [history, navigate, onClick, replace, state, preventScrollReset, target]);
    return (_jsx("a", { ref: ref, href: href, onClick: handleNav, "aria-current": ariaCurrent ?? (isCurrent ? currentToken : undefined), ...anchorProps }));
});
export default React.memo(Link);
