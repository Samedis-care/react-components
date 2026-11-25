import React from "react";
import { RouteProps } from "./Route";
/**
 * Props of {@link Routes}
 */
export interface RoutesProps {
    /**
     * The Route elements; the first whose path matches the current location is
     * rendered, none if no path matches. Any element with a string `path` prop
     * takes part, e.g. a component that takes RouteProps and renders a Route; an
     * element without one is never rendered.
     */
    children: React.ReactElement<RouteProps>[];
}
declare const _default: React.MemoExoticComponent<(props: RoutesProps) => React.JSX.Element>;
export default _default;
