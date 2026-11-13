import React from "react";
import { RouteProps } from "../../standalone/Routes/Route";
/**
 * Makes the entries of a `RoutedTabPanelWrapper`
 * @returns `tab(name, element)`, which makes the entry that shows `element`
 * while the tab `name` is open
 */
declare const useRoutedTabPanel: () => ((name: string, element: React.ReactElement) => React.ReactElement<RouteProps>);
export default useRoutedTabPanel;
