import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { buttonBaseClasses, styled, tabClasses, Tabs, } from "@mui/material";
import useLocation from "../../standalone/Routes/useLocation";
import { useRouteInfo } from "../../standalone";
import useNavigate from "../../standalone/Routes/useNavigate";
import focusRing from "../../utils/internal/focusRing";
/**
 * MUI's Tabs with the library's focus ring on a keyboard-focused Tab
 * (`Mui-focusVisible`): an outline, which forced colors keep, 4px inside the
 * tab's edge, where MUI draws its own Tab ring when the theme sets
 * `focusVisible`, so neither the scroller nor the selection indicator covers
 * it. With `textColor="inherit"` (tabs on a colored bar such as an AppBar)
 * the ring takes the tab's text color, which contrasts with the bar where the
 * primary color may not, and the focused tab is fully opaque, as MUI's ring
 * makes it. When the theme sets `focusVisible`, MUI's ring is the one shown.
 */
const RoutedTabsRoot = styled(Tabs, { name: "CcRoutedTabs", slot: "root" })(({ theme }) => ({
    [`& .${tabClasses.root}.${buttonBaseClasses.focusVisible}`]: focusRing(theme, -6),
    ...(!theme.focusVisible && {
        [`& .${tabClasses.textColorInherit}.${buttonBaseClasses.focusVisible}`]: {
            outlineColor: "currentColor",
            opacity: 1,
        },
    }),
}));
/**
 * The values MUI's `Tabs` gives its children: each element's `value`, or its
 * index among the elements when it has none
 * @param children The Tabs' children
 * @returns The values, in order
 */
const getTabValues = (children) => React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child, index) => {
    const value = child.props.value;
    return value === undefined ? index : value;
});
/**
 * Turns MUI's focus ripple off on each child that does not set
 * `disableFocusRipple` itself
 * @param children The Tabs' children
 * @returns The children, each element among them with the prop set
 */
const withoutFocusRipple = (children) => React.Children.map(children, (child) => React.isValidElement(child) &&
    child.type !== React.Fragment &&
    child.props.disableFocusRipple === undefined
    ? React.cloneElement(child, { disableFocusRipple: true })
    : child);
/**
 * MUI `Tabs` whose selected tab is a segment of the URL (see `children`).
 * A keyboard-focused tab shows a 2px focus ring inside its edge, in the
 * primary color, or in the tab's text color with `textColor="inherit"` (tabs
 * on an AppBar); MUI's own ring when the theme sets `focusVisible`. The
 * theme styles it under `CcRoutedTabs` (`root` is the Tabs root).
 * @param props The props
 */
const RoutedTabs = (props) => {
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
    const segment = pathname
        .substring(url.length)
        .split("/")
        .filter((entry) => entry)[0] ?? "";
    const values = getTabValues(props.children);
    // MUI logs an error for a value no Tab has. With such a segment the default
    // panel (the catch-all) is the one shown, so its Tab is the selected one.
    const current = values.includes(segment)
        ? segment
        : values.includes("")
            ? ""
            : false;
    return (_jsx(RoutedTabsRoot, { ...props, value: current, onChange: handleChange, children: withoutFocusRipple(props.children) }));
};
export default React.memo(RoutedTabs);
