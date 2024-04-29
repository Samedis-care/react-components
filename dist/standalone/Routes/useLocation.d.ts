import type { Location } from "history";
import React from "react";
export declare const LocationContext: React.Context<Location | null>;
/**
 * Use the current location
 */
declare const useLocation: () => Location;
export default useLocation;
