/**
 * Encodes one part of a DOM id so that different parts never produce the same
 * text: `encodeURIComponent` escapes whitespace and the characters it uses as
 * separators, and leaves only characters an id may contain unescaped.
 * @param part The url or the value
 * @returns The part as it appears in the id
 */
const idPart = (part: string): string => encodeURIComponent(part);

/**
 * The Route's url as it appears in the id: without a trailing "/", as the bar
 * builds its tab urls. A Route at `/*` has the url "/", so without this the bar
 * and a panel would derive different ids under it.
 * @param url The url of the Route
 * @returns The url part of the id
 */
const urlPart = (url: string): string =>
	idPart(url.endsWith("/") ? url.substring(0, url.length - 1) : url);

/**
 * The DOM id of the panel of the Tab with `value` in the bar of the Route at
 * `url`: what that Tab's `aria-controls` points at.
 *
 * The bar (`RoutedTabs`) and the panel (`RoutedTabPanelWrapper`) are separate
 * components under the same Route, so they derive the ids from that Route's
 * url and the Tab's value instead of sharing a `useId`. Each part is
 * `encodeURIComponent`-encoded and they are joined with ":" (which the encoding
 * always escapes in a part), so two different (url, value) pairs never get the
 * same id: no two bars, nested or not, collide. An id can contain "%" and ":";
 * select it with `document.getElementById` or `CSS.escape`.
 *
 * Two bars under one Route with the same values still give the same ids.
 *
 * A trailing "/" of `url` is ignored, so a Route at `/*` (url "/") and the
 * bar, which builds its tab urls without it, agree.
 * @param url The url of the Route, e.g. `/settings` or `/users/1`
 * @param value The Tab's `value`, `""` for the default tab
 * @returns The panel's id
 */
export const getTabPanelId = (url: string, value: unknown): string =>
	`cc-routed-tabpanel-${urlPart(url)}:${idPart(String(value))}`;

/**
 * The DOM id of the Tab with `value` in the bar of the Route at `url`: what
 * its panel's `aria-labelledby` points at. See {@link getTabPanelId}.
 * @param url The url of the Route, e.g. `/settings` or `/users/1`
 * @param value The Tab's `value`, `""` for the default tab
 * @returns The Tab's id
 */
export const getTabId = (url: string, value: unknown): string =>
	`cc-routed-tab-${urlPart(url)}:${idPart(String(value))}`;
