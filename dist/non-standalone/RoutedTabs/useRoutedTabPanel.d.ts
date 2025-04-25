import React from "react";
import { RouteProps } from "../../standalone/Routes/Route";
declare const useRoutedTabPanel: () => ((name: string, children: React.ReactElement<RouteProps>) => React.ReactElement<RouteProps>);
export default useRoutedTabPanel;
