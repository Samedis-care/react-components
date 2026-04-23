import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import Routes from "../../standalone/Routes/Routes";
const RoutedTabPanelWrapper = (props) => {
    return _jsx(Routes, { children: props.children });
};
export default React.memo(RoutedTabPanelWrapper);
