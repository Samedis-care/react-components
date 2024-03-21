import React from "react";
import Routes from "../../standalone/Routes/Routes";
const RoutedTabPanelWrapper = (props) => {
    return React.createElement(Routes, null, props.children);
};
export default React.memo(RoutedTabPanelWrapper);
