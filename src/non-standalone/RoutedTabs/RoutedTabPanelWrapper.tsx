import React, { useLayoutEffect, useRef, useState } from "react";
import Routes from "../../standalone/Routes/Routes";
import {
	RouteProps,
	useRouteInfo,
	useRoutePrefix,
} from "../../standalone/Routes/Route";
import useLocation from "../../standalone/Routes/useLocation";
import joinRoutePath from "../../standalone/Routes/joinRoutePath";
import matchPath from "../../standalone/Routes/matchPath";
import { getTabId, getTabPanelId } from "./tabPanelIds";

/**
 * Props of {@link RoutedTabPanelWrapper}
 */
export interface RoutedTabPanelWrapperProps {
	/**
	 * The panels: the entries made with `tab(name, element)` from
	 * `useRoutedTabPanel`, any number of them, as JSX children or as an
	 * array. `false`, `null` and `undefined` are skipped, so a conditional
	 * panel is `{isAdmin && tab("sync", <Sync />)}`.
	 */
	children: React.ReactNode;
}

/**
 * What Tab reaches inside a panel: the elements the HTML spec makes focusable,
 * except the disabled ones and an `input` of type `hidden`, and the elements
 * with a `tabindex` other than -1. A panel with one of these is no tab stop
 * itself, so Tab goes from the tab straight to that control.
 */
const FOCUSABLE_CONTENT = [
	"a[href]",
	"area[href]",
	"button:not([disabled])",
	"input:not([disabled]):not([type='hidden'])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"iframe",
	"object",
	"embed",
	"summary",
	"audio[controls]",
	"video[controls]",
	"[contenteditable]:not([contenteditable='false'])",
	"[tabindex]:not([tabindex='-1'])",
].join(", ");

/**
 * The value of the Tab that opens a panel entry: the entry's Route path
 * without the trailing "/*" (`tab(name, …)` makes `<name>/*`), and without a
 * leading "/" when the entry spells it out.
 * @param path The entry's path
 * @returns The Tab's value
 */
const tabValue = (path: string): string =>
	path.replace(/\/\*$/, "").replace(/^\//, "");

/**
 * Renders the panel of the current tab: the first of its entries whose path
 * matches the URL, nothing when none does. A `div` with `role="tabpanel"`
 * wraps it, named by its tab (`aria-labelledby`), with matching `id` and the
 * `aria-controls` of that tab (see `RoutedTabs`). Place it under the same Route
 * as its `RoutedTabs`.
 * - The panel is a tab stop (`tabindex="0"`) while it contains nothing
 *   focusable, as the APG asks: Tab from the selected tab then reaches the
 *   panel. With a focusable control in it, it is no tab stop, so Tab goes from
 *   the tab straight to that control. The content is checked when the wrapper
 *   renders; a control that appears later, e.g. from a state change inside the
 *   panel, does not take the panel out of the tab order.
 * - The wrapper has no padding or paper of its own: add it to the panel
 *   content.
 * - The id comes from the enclosing Route's url and the entry's value. Two tab
 *   bars under one Route (not nested ones, whose Route url differs) would
 *   therefore give their panels the same ids, and a panel whose value has no Tab
 *   is labelled by an id no element carries.
 * @param props The props
 */
const RoutedTabPanelWrapper = (props: RoutedTabPanelWrapperProps) => {
	const entries = React.Children.toArray(props.children).filter(
		React.isValidElement<RouteProps>,
	);
	const { pathname } = useLocation();
	const routePrefix = useRoutePrefix();
	// The entry Routes renders: the first whose path matches the url
	const matched = entries.find(
		(entry) =>
			!!matchPath(
				{ ...entry.props, path: joinRoutePath(routePrefix, entry.props.path) },
				pathname,
			),
	);
	const { url } = useRouteInfo();
	const panelRef = useRef<HTMLDivElement>(null);
	const [hasFocusableContent, setHasFocusableContent] = useState(false);
	useLayoutEffect(() => {
		const panel = panelRef.current;
		setHasFocusableContent(
			panel !== null && panel.querySelector(FOCUSABLE_CONTENT) !== null,
		);
	}, [props.children, pathname]);
	if (!matched) return null;
	const value = tabValue(matched.props.path);
	return (
		<div
			ref={panelRef}
			role="tabpanel"
			id={getTabPanelId(url, value)}
			aria-labelledby={getTabId(url, value)}
			tabIndex={hasFocusableContent ? undefined : 0}
		>
			<Routes>{entries}</Routes>
		</div>
	);
};

export default React.memo(RoutedTabPanelWrapper);
