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
    /**
     * Is the router inside another one? Then the focus moves only to a
     * PageTitle inside it.
     */
    nested: boolean;
}
declare const _default: React.MemoExoticComponent<(props: NavigationFocusProps) => React.JSX.Element>;
export default _default;
