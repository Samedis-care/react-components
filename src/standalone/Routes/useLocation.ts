import type { Location } from "history";
import React, { useContext } from "react";

/**
 * The current location of the nearest HistoryRouter, null outside of one.
 * Read it with {@link useLocation}.
 */
export const LocationContext = React.createContext<Location | null>(null);

/**
 * Use the current location
 * Throws outside a HistoryRouter; Framework renders one.
 */
const useLocation = (): Location => {
	const location = useContext(LocationContext);
	if (!location)
		throw new Error(
			"Location context missing, did you forget to add Components-Care Framework or HistoryRouter?",
		);
	return location;
};

export default useLocation;
