import React from "react";
import Route from "../../standalone/Routes/Route";
const useRoutedTabPanel = () => {
    return function createTab(name, children) {
        return React.createElement(Route, { key: name, path: `${name}/*`, element: children });
    };
};
export default useRoutedTabPanel;
