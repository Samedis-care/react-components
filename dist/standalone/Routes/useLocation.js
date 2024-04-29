import React, { useContext } from "react";
export const LocationContext = React.createContext(null);
/**
 * Use the current location
 */
const useLocation = () => {
    const location = useContext(LocationContext);
    if (!location)
        throw new Error("Location context missing");
    return location;
};
export default useLocation;
