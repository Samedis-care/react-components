/**
 * The part a route url or a Tab value contributes to a DOM id: characters
 * that an id reference cannot carry (whitespace separates the ids in
 * `aria-labelledby` and `aria-controls`) or that a CSS selector would need to
 * escape are replaced with "-", and no "-" is left at either end.
 * @param part The url or the value
 * @returns The part as it appears in the id
 */
const idPart = (part: string): string =>
	part.replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * The DOM id of the panel of the Tab with `value` in the bar of the Route at
 * `url`: what that Tab's `aria-controls` points at.
 *
 * The bar (`RoutedTabs`) and the panel (`RoutedTabPanelWrapper`) are separate
 * components under the same Route, so they derive the ids from that Route's
 * url and the Tab's value instead of sharing a `useId`. Two bars under one
 * Route, with the same values, would give the same ids.
 * @param url The url of the Route, e.g. `/settings` or `/users/1`
 * @param value The Tab's `value`, `""` for the default tab
 * @returns The panel's id
 */
export const getTabPanelId = (url: string, value: unknown): string =>
	`cc-routed-tabpanel-${idPart(url)}-${idPart(String(value))}`;

/**
 * The DOM id of the Tab with `value` in the bar of the Route at `url`: what
 * its panel's `aria-labelledby` points at. See {@link getTabPanelId}.
 * @param url The url of the Route, e.g. `/settings` or `/users/1`
 * @param value The Tab's `value`, `""` for the default tab
 * @returns The Tab's id
 */
export const getTabId = (url: string, value: unknown): string =>
	`cc-routed-tab-${idPart(url)}-${idPart(String(value))}`;
