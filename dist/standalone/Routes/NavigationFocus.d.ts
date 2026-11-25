import React from "react";
import type { Location } from "history";
import { NavigationFocusManager } from "./NavigationFocusManager";
export interface NavigationFocusProps {
    /**
     * The router's manager, to which it reports its navigations
     */
    manager: NavigationFocusManager;
    /**
     * The router's current location
     */
    location: Location;
}
declare const _default: React.MemoExoticComponent<(props: NavigationFocusProps) => React.JSX.Element>;
export default _default;
