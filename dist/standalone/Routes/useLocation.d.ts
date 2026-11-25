import type { Location } from "history";
import React from "react";
/**
 * The current location of the nearest HistoryRouter, null outside of one.
 * Read it with {@link useLocation}.
 */
export declare const LocationContext: React.Context<Location | null>;
/**
 * Use the current location
 * Throws outside a HistoryRouter; Framework renders one.
 */
declare const useLocation: () => Location;
export default useLocation;
