import React from "react";
import Route, { RouteProps } from "../../standalone/Routes/Route";

const useRoutedTabPanel = (): ((
	name: string,
	children: React.ReactElement<RouteProps>,
) => React.ReactElement<RouteProps>) => {
	return function createTab(
		name: string,
		children: React.ReactElement,
	): React.ReactElement<RouteProps> {
		return <Route key={name} path={`${name}/*`} element={children} />;
	};
};

export default useRoutedTabPanel;
