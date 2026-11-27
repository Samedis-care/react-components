import React from "react";
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
    /**
     * Is the router inside another one? Then "#top" scrolls only the scroll
     * containers registered with it to the top.
     */
    nested: boolean;
}
declare const _default: React.MemoExoticComponent<(props: NavigationScrollProps) => null>;
export default _default;
