import React from "react";
import { RouteProps } from "./Route";
/**
 * The entry that `Routes` renders for a URL: of the entries whose path, joined
 * with the enclosing Route's prefix, matches the URL, the most specific one
 * (compareRouteSpecificity), and on a tie the one listed first. `Routes`
 * renders the entry this returns, and `RoutedTabPanelWrapper` names its panel
 * after it, so both agree on which entry is shown. An entry without a string
 * `path` prop never matches.
 * @param entries The entries, in render order
 * @param routePrefix The prefix from `useRoutePrefix`
 * @param pathname The URL pathname
 * @returns The most specific matching entry, `undefined` when none matches
 */
declare const findMatchingRoute: <T extends React.ReactElement<RouteProps>>(entries: T[], routePrefix: string, pathname: string) => T | undefined;
export default findMatchingRoute;
