import React, { useContext } from "react";
/**
 * The current location of the nearest HistoryRouter, null outside of one.
 * Read it with {@link useLocation}.
 */
export const LocationContext = React.createContext(null);
/**
 * Use the current location
 * Throws outside a HistoryRouter; Framework renders one.
 */
const useLocation = () => {
    const location = useContext(LocationContext);
    if (!location)
        throw new Error("Location context missing, did you forget to add Components-Care Framework or HistoryRouter?");
    return location;
};
export default useLocation;
