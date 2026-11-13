import React from "react";
import Routes from "../../standalone/Routes/Routes";
import { RouteProps } from "../../standalone/Routes/Route";

/**
 * Props of {@link RoutedTabPanelWrapper}
 */
export interface RoutedTabPanelWrapperProps {
	/**
	 * The panels: the entries made with `tab(name, element)` from
	 * `useRoutedTabPanel`, any number of them, as JSX children or as an
	 * array. `false`, `null` and `undefined` are skipped, so a conditional
	 * panel is `{isAdmin && tab("sync", <Sync />)}`.
	 */
	children: React.ReactNode;
}

/**
 * Renders the panel of the current tab: the first of its entries whose path
 * matches the URL, nothing when none does. Place it under the same Route as
 * its `RoutedTabs`.
 * @param props The props
 */
const RoutedTabPanelWrapper = (props: RoutedTabPanelWrapperProps) => {
	const entries = React.Children.toArray(props.children).filter(
		React.isValidElement<RouteProps>,
	);
	return <Routes>{entries}</Routes>;
};

export default React.memo(RoutedTabPanelWrapper);
