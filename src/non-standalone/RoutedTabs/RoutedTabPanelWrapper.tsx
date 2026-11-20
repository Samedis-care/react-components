import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { styled, useThemeProps } from "@mui/material";
import Routes from "../../standalone/Routes/Routes";
import {
	RouteProps,
	useRouteInfo,
	useRoutePrefix,
} from "../../standalone/Routes/Route";
import useLocation from "../../standalone/Routes/useLocation";
import findMatchingRoute from "../../standalone/Routes/findMatchingRoute";
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
	/**
	 * CSS class of the panel element, after the theme's.
	 */
	className?: string;
}

export type RoutedTabPanelWrapperClassKey = "root";

const Root = styled("div", {
	name: "CcRoutedTabPanelWrapper",
	slot: "root",
})({});

/**
 * What Tab reaches inside a panel: the elements the HTML spec makes focusable,
 * except the disabled ones, an `input` of type `hidden`, and any element taken
 * out of the tab order by a negative `tabindex`; and the elements with a
 * `tabindex` of 0 or more. A panel with one of these is no tab stop itself, so
 * Tab goes from the tab straight to that control. Elements inside `[hidden]`,
 * `[inert]` or a disabled `fieldset` are no tab stops either; `hasTabbable`
 * skips them.
 */
const FOCUSABLE_CONTENT = [
	"a[href]:not([tabindex^='-'])",
	"area[href]:not([tabindex^='-'])",
	"button:not([disabled]):not([tabindex^='-'])",
	"input:not([disabled]):not([type='hidden']):not([tabindex^='-'])",
	"select:not([disabled]):not([tabindex^='-'])",
	"textarea:not([disabled]):not([tabindex^='-'])",
	"iframe:not([tabindex^='-'])",
	"object:not([tabindex^='-'])",
	"embed:not([tabindex^='-'])",
	"summary:not([tabindex^='-'])",
	"audio[controls]:not([tabindex^='-'])",
	"video[controls]:not([tabindex^='-'])",
	"[contenteditable]:not([contenteditable='false']):not([tabindex^='-'])",
	"[tabindex]:not([tabindex^='-'])",
].join(", ");

/**
 * Whether an ancestor makes the element unreachable with Tab: a `[hidden]` or
 * `[inert]` subtree, or a disabled `fieldset` (except its first `legend`, the
 * rest of which is still reachable).
 * @param element The element to check
 * @returns Whether Tab does not reach it
 */
const isOutOfTabOrder = (element: Element): boolean => {
	if (element.closest("[hidden], [inert]") !== null) return true;
	// display: none and content-visibility: hidden (not in jsdom, where the
	// method is missing, and a stylesheet's display is not computed either)
	if (
		typeof element.checkVisibility === "function" &&
		!element.checkVisibility()
	)
		return true;
	for (let node = element.parentElement; node; node = node.parentElement) {
		if (node.tagName !== "FIELDSET") continue;
		if (!(node as HTMLFieldSetElement).disabled) continue;
		const legend = Array.from(node.children).find(
			(child) => child.tagName === "LEGEND",
		);
		if (!legend || !legend.contains(element)) return true;
	}
	return false;
};

/**
 * Whether Tab reaches a control inside the panel.
 * @param panel The panel element
 * @returns Whether it contains a control in the tab order
 */
const hasTabbable = (panel: HTMLElement): boolean =>
	Array.from(panel.querySelectorAll(FOCUSABLE_CONTENT)).some(
		(element) => !isOutOfTabOrder(element),
	);

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
 *   the tab straight to that control. The content is watched, so a control
 *   that appears or goes away after mount, e.g. from a state change or an
 *   async load inside the panel, updates the tab stop.
 * - While the panel itself has focus it stays a tab stop, so focus is not
 *   dropped to the body when a control appears under it; the flag is
 *   recomputed when it loses focus.
 * - The panel is a `CcRoutedTabPanelWrapper` root: style it with
 *   `theme.components.CcRoutedTabPanelWrapper.styleOverrides.root` or the
 *   `className` prop. It has no padding or paper of its own: add it to the
 *   panel content or to the root.
 * - The id comes from the enclosing Route's url and the entry's value. Two tab
 *   bars under one Route (not nested ones, whose Route url differs) would
 *   therefore give their panels the same ids, and a panel whose value has no Tab
 *   is labelled by an id no element carries.
 * @param inProps The props
 */
const RoutedTabPanelWrapper = (inProps: RoutedTabPanelWrapperProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcRoutedTabPanelWrapper",
	});
	const { children, className } = props;
	const entries = React.Children.toArray(children).filter(
		React.isValidElement<RouteProps>,
	);
	const { pathname } = useLocation();
	const routePrefix = useRoutePrefix();
	const matched = findMatchingRoute(entries, routePrefix, pathname);
	const { url } = useRouteInfo();
	const panelRef = useRef<HTMLDivElement>(null);
	const [hasFocusableContent, setHasFocusableContent] = useState(false);
	const updateTabStop = useCallback(() => {
		const panel = panelRef.current;
		if (panel === null) return;
		const next = hasTabbable(panel);
		// Keep the tab stop while the panel has focus; otherwise removing it
		// would drop focus to the body when a control appears under the panel.
		// The blur listener recomputes.
		if (next && document.activeElement === panel) return;
		setHasFocusableContent(next);
	}, []);
	useLayoutEffect(() => {
		const panel = panelRef.current;
		if (panel === null) return;
		updateTabStop();
		const observer = new MutationObserver(updateTabStop);
		observer.observe(panel, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [
				"disabled",
				"tabindex",
				"href",
				"contenteditable",
				"type",
				"controls",
				"hidden",
				"inert",
			],
		});
		panel.addEventListener("blur", updateTabStop);
		return () => {
			observer.disconnect();
			panel.removeEventListener("blur", updateTabStop);
		};
	}, [children, pathname, updateTabStop]);
	if (!matched) return null;
	const value = tabValue(matched.props.path);
	return (
		<Root
			ref={panelRef}
			role="tabpanel"
			id={getTabPanelId(url, value)}
			aria-labelledby={getTabId(url, value)}
			tabIndex={hasFocusableContent ? undefined : 0}
			className={className}
		>
			<Routes>{entries}</Routes>
		</Root>
	);
};

export default React.memo(RoutedTabPanelWrapper);
