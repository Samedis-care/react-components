import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { Tabs } from "@mui/material";
import useLocation from "../../standalone/Routes/useLocation";
import { useRouteInfo } from "../../standalone";
import useNavigate from "../../standalone/Routes/useNavigate";
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
    return (_jsx(Tabs, { ...props, value: current, onChange: handleChange, children: props.children }));
};
export default React.memo(RoutedTabs);
