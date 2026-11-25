import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { buttonBaseClasses, styled, tabClasses, Tabs, tabsClasses, useThemeProps, } from "@mui/material";
import useLocation from "../../standalone/Routes/useLocation";
import { useRouteInfo } from "../../standalone";
import useNavigate from "../../standalone/Routes/useNavigate";
import focusRing from "../../utils/internal/focusRing";
import combineClassNames from "../../utils/combineClassNames";
import { getTabId, getTabPanelId } from "./tabPanelIds";
/**
 * MUI's Tabs with the library's focus ring on a keyboard-focused Tab
 * (`Mui-focusVisible`): an outline, which forced colors keep, 4px inside the
 * tab's edge, where MUI draws its own Tab ring when the theme sets
 * `focusVisible`, so neither the scroller nor the selection indicator covers
 * it. With `textColor="inherit"` (tabs on a colored bar such as an AppBar)
 * the ring takes the tab's text color, which contrasts with the bar where the
 * primary color may not, and the focused tab is fully opaque, as MUI's ring
 * makes it. When the theme sets `focusVisible`, MUI's ring is the one shown.
 *
 * `CcRoutedTabs-centered` centers the tabs only while they fit (`safe
 * center`), so overflow goes to the end edge, where the bar scrolls, and not
 * past the start edge, where nothing can scroll to it.
 * `CcRoutedTabs-fullWidth` is a scrollable bar whose tabs share its width
 * equally, as MUI's `fullWidth` tabs do, but no tab gets narrower than its
 * longest word.
 */
const RoutedTabsRoot = styled(Tabs, { name: "CcRoutedTabs", slot: "root" })(({ theme }) => ({
    [`& .${tabClasses.root}.${buttonBaseClasses.focusVisible}`]: focusRing(theme, -6),
    ...(!theme.focusVisible && {
        [`& .${tabClasses.textColorInherit}.${buttonBaseClasses.focusVisible}`]: {
            outlineColor: "currentColor",
            opacity: 1,
        },
    }),
    [`&.CcRoutedTabs-centered .${tabsClasses.list}`]: {
        justifyContent: "safe center",
    },
    [`&.CcRoutedTabs-fullWidth .${tabClasses.root}`]: {
        flexGrow: 1,
        flexBasis: 0,
        maxWidth: "none",
        minWidth: "min-content",
    },
}));
/**
 * The children MUI's `Tabs` renders, in its order, with the value it gives
 * each: the element's `value`, or its index among the elements when it has
 * none.
 * @param children The Tabs' children
 * @returns The elements with their values
 */
const getTabEntries = (children) => React.Children.toArray(children)
    .filter((React.isValidElement))
    .map((child, index) => ({
    child,
    value: child.props.value === undefined ? index : child.props.value,
}));
/**
 * Adds to each Tab the `id` its panel's `aria-labelledby` points at and the
 * `aria-controls` of that panel, and turns MUI's focus ripple off on each Tab
 * that does not set `disableFocusRipple` itself.
 * @param entries The Tabs' children with their values
 * @param url The url of the enclosing Route, for the ids
 * @param linkTabsToPanels Whether the Tabs get the `id` and `aria-controls`
 * @returns The Tab elements with the props set
 */
const withTabProps = (entries, url, linkTabsToPanels) => entries.map(({ child, value }) => child.type === React.Fragment
    ? child
    : React.cloneElement(child, {
        ...(linkTabsToPanels && {
            id: getTabId(url, value),
            "aria-controls": getTabPanelId(url, value),
        }),
        ...(child.props.disableFocusRipple === undefined && {
            disableFocusRipple: true,
        }),
    }));
/**
 * MUI `Tabs` whose selected tab is a segment of the URL (see `children`).
 * The bar scrolls when its tabs do not fit, with scroll buttons also on
 * phones (see `variant`, `centered` and `allowScrollButtonsMobile`), so every
 * tab can be reached at 320px.
 * A keyboard-focused tab shows a 2px focus ring inside its edge, in the
 * primary color, or in the tab's text color with `textColor="inherit"` (tabs
 * on an AppBar); MUI's own ring when the theme sets `focusVisible`. The
 * theme sets default props under `CcRoutedTabs.defaultProps` and styles it
 * under `CcRoutedTabs` (`root` is the Tabs root).
 * @param inProps The props
 */
const RoutedTabs = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcRoutedTabs" });
    const { linkTabsToPanels = true, variant = "scrollable", centered = false, allowScrollButtonsMobile = true, className, onFocus, ...tabsProps } = props;
    // MUI's fullWidth bar never scrolls: a scrollable one whose tabs grow
    const fullWidth = variant === "fullWidth" && tabsProps.orientation !== "vertical";
    const { pathname, search, hash } = useLocation();
    let { url } = useRouteInfo();
    if (url.endsWith("/"))
        url = url.substring(0, url.length - 1);
    const navigate = useNavigate();
    const handleChange = useCallback((_evt, value) => {
        navigate({
            pathname: url + "/" + value,
            search,
            hash,
        });
    }, [navigate, url, search, hash]);
    // The browser scrolls a focused tab only until part of it shows, so the
    // edge of the bar or a scroll button could cut it off. (jsdom has no
    // scrollIntoView.)
    const handleFocus = useCallback((evt) => {
        onFocus?.(evt);
        if (evt.target.getAttribute("role") === "tab") {
            evt.target.scrollIntoView?.({ block: "nearest", inline: "nearest" });
        }
    }, [onFocus]);
    const segment = pathname
        .substring(url.length)
        .split("/")
        .filter((entry) => entry)[0] ?? "";
    const entries = getTabEntries(tabsProps.children);
    const values = entries.map((entry) => entry.value);
    // MUI logs an error for a value no Tab has. With such a segment the default
    // panel (the catch-all) is the one shown, so its Tab is the selected one.
    const current = values.includes(segment)
        ? segment
        : values.includes("")
            ? ""
            : false;
    return (_jsx(RoutedTabsRoot, { ...tabsProps, className: combineClassNames([
            className,
            centered && "CcRoutedTabs-centered",
            fullWidth && "CcRoutedTabs-fullWidth",
        ]), variant: fullWidth ? "scrollable" : variant, 
        // centered by the class above, which also works with "scrollable"
        centered: false, allowScrollButtonsMobile: allowScrollButtonsMobile, value: current, onChange: handleChange, onFocus: handleFocus, children: withTabProps(entries, url, linkTabsToPanels) }));
};
export default React.memo(RoutedTabs);
