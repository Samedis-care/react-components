import React, { useLayoutEffect } from "react";
import type { Location } from "history";
import type { NavigationScrollManager } from "./NavigationScrollManager";

/**
 * Props of {@link NavigationScroll}
 */
export interface NavigationScrollProps {
	/**
	 * The router's manager, to which it reports the locations rendered
	 */
	manager: NavigationScrollManager;
	/**
	 * The router's current location
	 */
	location: Location;
}

/**
 * Scrolls to the element the hash of a navigation names, and focuses it, once
 * the navigation's location has rendered, with the NavigationScrollManager of
 * the HistoryRouter. The router renders it after its children and before
 * NavigationFocus. Renders nothing.
 * @param props The props
 */
const NavigationScroll = (props: NavigationScrollProps) => {
	const { manager, location } = props;
	// a layout effect: in the commit that renders the location, before it is
	// painted, once the children's layout effects have run, and before the
	// focus check of NavigationFocus, which then finds the focus on the
	// element
	useLayoutEffect(() => {
		manager.rendered(location);
	}, [manager, location]);
	return null;
};

export default React.memo(NavigationScroll);
