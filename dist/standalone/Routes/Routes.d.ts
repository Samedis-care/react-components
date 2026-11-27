import React from "react";
/**
 * Props of {@link Routes}
 */
export interface RoutesProps {
    /**
     * The Route elements, as JSX children or in an array. Of those whose path
     * matches the current location the most specific one is rendered, whatever
     * the order: "/devices/new/*" before "/devices/*" and before
     * "/devices/:id/*" at "/devices/new"; on a tie the one listed first (see
     * `RouteProps.path` for the order). None is rendered if no path matches: add
     * `<Route path="*" … />` for a not-found page. In development, a Routes
     * outside of every Route warns in the console when no path matches (once
     * per path); a nested Routes renders nothing then without a word.
     * `false`, `null` and `undefined` are skipped, so a conditional route is
     * `{isAdmin && <Route … />}`, and the children of a fragment take its place,
     * so a group of routes can be conditional too. Any element with a string
     * `path` prop takes part, e.g. a component that takes RouteProps and renders
     * a Route; an element without one is never rendered.
     *
     * The rendered child is keyed by its path, and its own key, if it has one,
     * takes effect as on any element. Switching to another child remounts the
     * element, and so does a new key on the child that is rendered
     * (`<Route key={tenantId} … />`). Navigating within the same child (e.g.
     * "/devices/1" to "/devices/2" under "/devices/:id") keeps it mounted. JSX
     * children need no keys; in an array, give every child a key, as anywhere in
     * React (React 18 warns without).
     */
    children: React.ReactNode;
}
declare const _default: React.MemoExoticComponent<(props: RoutesProps) => React.JSX.Element>;
export default _default;
