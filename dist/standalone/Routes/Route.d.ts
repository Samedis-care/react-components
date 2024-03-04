import React from "react";
export interface RouteProps {
    /**
     * Path of the route
     */
    path: string;
    /**
     * The element to render if the route is matched
     */
    element: React.ReactElement;
}
interface RouteContextType {
    /**
     * The full route path (including parent routes)
     */
    path: string;
    /**
     * The full route URL (with params)
     */
    url: string;
}
export declare const RouteContext: React.Context<RouteContextType | null>;
/**
 * @returns NonNullable<RouteContextType>
 */
export declare const useRouteInfo: () => RouteContextType;
/**
 * Use parent route path
 */
export declare const useRoutePrefix: () => string;
declare const _default: React.MemoExoticComponent<(props: RouteProps) => React.JSX.Element>;
export default _default;
