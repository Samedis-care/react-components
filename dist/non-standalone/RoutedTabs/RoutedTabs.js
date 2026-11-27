import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useRef } from "react";
import { buttonBaseClasses, styled, tabClasses, Tabs, tabsClasses, useThemeProps, } from "@mui/material";
import useLocation from "../../standalone/Routes/useLocation";
import { useRouteInfo } from "../../standalone";
import useNavigate from "../../standalone/Routes/useNavigate";
import { decodeSegment } from "../../standalone/Routes/matchPath";
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
 *
 * In forced-colors mode (Windows contrast themes) the selection indicator is
 * drawn in the system's selection color (`Highlight`). Forced colors would
 * paint its background in the canvas color and give every label the same
 * text color, so nothing would show which tab is open.
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
    "@media (forced-colors: active)": {
        [`& .${tabsClasses.indicator}`]: {
            forcedColorAdjust: "none",
            backgroundColor: "Highlight",
        },
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
 * The value of the Tab whose panel `RoutedTabPanelWrapper` shows, for MUI's
 * `Tabs`. The location's first segment after the enclosing Route's url is read
 * as the panels' Routes read it: empty segments ("//") are skipped, it is
 * percent-decoded and compared case-insensitively. A value with "/" spans
 * several segments, so its Tab is never selected. When no Tab has the segment,
 * the default panel (the catch-all) is shown, so it is the default tab (`""`)
 * if the bar has one, else `false`: no tab, and no error from MUI for a value
 * no Tab has.
 * @param entries The Tabs with their values
 * @param pathname The location pathname
 * @param url The enclosing Route's url, made of the location's segments that
 * the Route matched
 * @returns The value of the selected Tab, `false` for none
 */
const getCurrentValue = (entries, pathname, url) => {
    const depth = url.split("/").filter((part) => part).length;
    const segment = pathname.split("/").filter((part) => part)[depth];
    const wanted = segment === undefined ? "" : decodeSegment(segment).toLowerCase();
    const match = entries.find(({ value }) => {
        const text = String(value);
        return !text.includes("/") && text.toLowerCase() === wanted;
    });
    if (match)
        return match.value;
    return entries.some(({ value }) => value === "") ? "" : false;
};
/**
 * The development warning for a Tab whose value is not one path segment, a
 * string without "/". A fragment gets none: MUI logs an error for it.
 * @param entry The Tab with its value
 * @param index Its index among the Tabs, as MUI counts them
 * @returns The warning, `null` for a value that is one segment
 */
const getTabValueWarning = ({ child, value }, index) => {
    if (child.type === React.Fragment)
        return null;
    const advice = 'Give each Tab a value that is one path segment, a string without "/", and its panel the same name: tab(value, …).';
    if (child.props.value === undefined)
        return `RoutedTabs: the Tab at index ${index} has no value, so MUI gives it its index. ${advice}`;
    if (typeof value !== "string")
        return `RoutedTabs: the value of the Tab at index ${index} is ${String(value)}, not a string. ${advice}`;
    if (value.includes("/"))
        return `RoutedTabs: the Tab value "${value}" has a "/", so the Tab is never selected. ${advice}`;
    return null;
};
/**
 * MUI `Tabs` whose selected tab is a segment of the URL (see `children`).
 * Every bar is named, by `aria-label` or `aria-labelledby` (see
 * `RoutedTabsNameProps`): `<RoutedTabs aria-label={t("tabs.label")}>`.
 * Opening a tab pushes its URL (the route's own url for the default tab, see
 * `children`) and keeps the scroll position of the page
 * (`preventScrollReset`, see `useNavigate`): the bar, the focused tab and the
 * panel stay where the user is.
 * The bar scrolls when its tabs do not fit, with scroll buttons also on
 * phones (see `variant`, `centered` and `allowScrollButtonsMobile`), so every
 * tab can be reached at 320px.
 * A keyboard-focused tab shows a 2px focus ring inside its edge, in the
 * primary color, or in the tab's text color with `textColor="inherit"` (tabs
 * on an AppBar); MUI's own ring when the theme sets `focusVisible`. In
 * forced-colors mode (Windows contrast themes) the selection indicator under
 * the open tab is drawn in the system's selection color (`Highlight`), so it
 * stays visible there. The theme sets default props under
 * `CcRoutedTabs.defaultProps` and styles it under `CcRoutedTabs` (`root` is
 * the Tabs root).
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
            // the default tab is the route's own url, without a trailing "/"
            pathname: value === "" ? url || "/" : url + "/" + value,
            search,
            hash,
        }, 
        // the user stays on the page, with the bar and the focused tab in view
        { preventScrollReset: true });
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
    const { children } = tabsProps;
    const entries = getTabEntries(children);
    const current = getCurrentValue(entries, pathname, url);
    // development: name each Tab whose value is not one path segment, once per
    // bar and Tab
    const warnedTabs = useRef(null);
    useEffect(() => {
        if (process.env.NODE_ENV !== "development")
            return;
        if (!warnedTabs.current)
            warnedTabs.current = new Set();
        const warned = warnedTabs.current;
        getTabEntries(children).forEach((entry, index) => {
            const warning = getTabValueWarning(entry, index);
            if (warning === null || warned.has(warning))
                return;
            warned.add(warning);
            // eslint-disable-next-line no-console
            console.warn(warning);
        });
    }, [children]);
    return (_jsx(RoutedTabsRoot, { ...tabsProps, className: combineClassNames([
            className,
            centered && "CcRoutedTabs-centered",
            fullWidth && "CcRoutedTabs-fullWidth",
        ]), variant: fullWidth ? "scrollable" : variant, 
        // centered by the class above, which also works with "scrollable"
        centered: false, allowScrollButtonsMobile: allowScrollButtonsMobile, value: current, onChange: handleChange, onFocus: handleFocus, children: withTabProps(entries, url, linkTabsToPanels) }));
};
export default React.memo(RoutedTabs);
