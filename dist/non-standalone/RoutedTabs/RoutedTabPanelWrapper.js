import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import Routes from "../../standalone/Routes/Routes";
/**
 * Renders the panel of the current tab: the first of its entries whose path
 * matches the URL, nothing when none does. Place it under the same Route as
 * its `RoutedTabs`.
 * @param props The props
 */
const RoutedTabPanelWrapper = (props) => {
    const entries = React.Children.toArray(props.children).filter((React.isValidElement));
    return _jsx(Routes, { children: entries });
};
export default React.memo(RoutedTabPanelWrapper);
