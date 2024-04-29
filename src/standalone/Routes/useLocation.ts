import type { Location } from "history";
import React, { useContext } from "react";

export const LocationContext = React.createContext<Location | null>(null);

/**
 * Use the current location
 */
const useLocation = (): Location => {
	const location = useContext(LocationContext);
	if (!location) throw new Error("Location context missing");
	return location;
};

export default useLocation;
