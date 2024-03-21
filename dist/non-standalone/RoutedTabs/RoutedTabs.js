import React, { useCallback } from "react";
import { Tabs } from "@mui/material";
import useLocation from "../../standalone/Routes/useLocation";
import { useRouteInfo } from "../../standalone";
import useNavigate from "../../standalone/Routes/useNavigate";
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
    const current = pathname
        .substring(url.length)
        .split("/")
        .filter((entry) => entry)[0] ?? "";
    return (React.createElement(Tabs, { ...props, value: current, onChange: handleChange }, props.children));
};
export default React.memo(RoutedTabs);
