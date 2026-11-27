import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { styled } from "@mui/material";
import { usePageTitleRegistry } from "./DocumentTitle";
// visually hidden, as MUI's visuallyHidden, but fixed to the viewport's corner,
// so it never widens a page, also not a right-to-left one
const NavigationAnnouncement = styled("div")({
    border: 0,
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    padding: 0,
    position: "fixed",
    top: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});
/**
 * Keeps the keyboard focus and screen readers with the page after a push or
 * back/forward navigation (not after a replace, nor a navigation while the
 * router mounts), with the NavigationFocusManager of the HistoryRouter, which
 * renders it after its children.
 *
 * - When the focus is on no element (the focused link was part of the content
 *   the navigation replaced), on a hidden one, or out of view (the navigation
 *   scrolled the window to the top), it moves to the heading of the new page:
 *   the most specific PageTitle, else the first `<h1>` of the main landmark.
 *   A PageTitle that renders later (a lazy route, a record that is still
 *   loading) gets the focus then. The router inside another one moves it
 *   only to a PageTitle inside it, and leaves it where it is without one.
 * - Otherwise the focus stays (a navigation menu, a tab), and the new page
 *   title (see usePageTitle; of the router inside another one, the title set
 *   inside it) is announced in a polite live region when it differs from the
 *   one before.
 *
 * Both wait for the new page until the next navigation or the user's next
 * click, key press or scroll.
 * @param props The props
 */
const NavigationFocus = (props) => {
    const { manager, location, nested } = props;
    const registry = usePageTitleRegistry();
    const [announcement, setAnnouncement] = useState("");
    // a passive effect, after the children's: a navigation of their mount
    // effects (a redirect) is part of loading the page, not one to handle
    useEffect(() => {
        manager.attach({ registry, nested, announce: setAnnouncement });
        return () => manager.detach();
    }, [manager, registry, nested]);
    // a layout effect: the focus moves in the commit that renders the new page,
    // before it is painted, and after the layout effects of the children, in
    // which PageTitle sets its heading
    useLayoutEffect(() => {
        manager.rendered();
    }, [manager, location]);
    return (_jsx(NavigationAnnouncement, { "aria-live": "polite", "aria-atomic": "true", children: announcement }));
};
export default React.memo(NavigationFocus);
