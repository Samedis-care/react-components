import React from "react";
import Route from "../../standalone/Routes/Route";

const useRoutedTabPanel = (): ((
	name: string,
	children: React.ReactElement,
) => React.ReactElement) => {
	return function createTab(name: string, children: React.ReactElement) {
		return <Route key={name} path={`${name}/*`} element={children} />;
	};
};

export default useRoutedTabPanel;
