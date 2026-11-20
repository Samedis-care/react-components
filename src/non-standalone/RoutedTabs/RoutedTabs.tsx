import React, { useCallback } from "react";
import {
	buttonBaseClasses,
	styled,
	tabClasses,
	Tabs,
	TabsProps,
} from "@mui/material";
import useLocation from "../../standalone/Routes/useLocation";
import { useRouteInfo } from "../../standalone";
import useNavigate from "../../standalone/Routes/useNavigate";
import focusRing from "../../utils/internal/focusRing";
import { getTabId, getTabPanelId } from "./tabPanelIds";

export interface RoutedTabsProps extends Omit<TabsProps, "value" | "onChange"> {
	/**
	 * The MUI `Tab` elements. The selected Tab is the one whose `value` is the
	 * first path segment after the enclosing Route's url. The Tab with
	 * `value=""` is the default tab: it is selected at the route's own url,
	 * and also when no Tab has the segment (a stale link, a Tab that is not
	 * rendered, a path inside the default panel). Without a default tab, no
	 * tab is selected then.
	 *
	 * Each Tab gets `disableFocusRipple` unless it sets the prop itself: a
	 * keyboard-focused tab shows the focus ring, and MUI's pulsating focus
	 * ripple would cover its label. A click still shows the ripple.
	 *
	 * Each Tab also gets an `id` and an `aria-controls` naming the panel that
	 * `RoutedTabPanelWrapper` renders for its value, so a screen reader reads
	 * the panel as the tab's ("Security tab panel"). A Tab that sets those
	 * props itself has them replaced: the wrapper derives them from the route's
	 * url and the value.
	 */
	children: React.ReactNode;
}

export type RoutedTabsClassKey = "root";

/**
 * MUI's Tabs with the library's focus ring on a keyboard-focused Tab
 * (`Mui-focusVisible`): an outline, which forced colors keep, 4px inside the
 * tab's edge, where MUI draws its own Tab ring when the theme sets
 * `focusVisible`, so neither the scroller nor the selection indicator covers
 * it. With `textColor="inherit"` (tabs on a colored bar such as an AppBar)
 * the ring takes the tab's text color, which contrasts with the bar where the
 * primary color may not, and the focused tab is fully opaque, as MUI's ring
 * makes it. When the theme sets `focusVisible`, MUI's ring is the one shown.
 */
const RoutedTabsRoot = styled(Tabs, { name: "CcRoutedTabs", slot: "root" })(
	({ theme }) => ({
		[`& .${tabClasses.root}.${buttonBaseClasses.focusVisible}`]: focusRing(
			theme,
			-6,
		),
		...(!theme.focusVisible && {
			[`& .${tabClasses.textColorInherit}.${buttonBaseClasses.focusVisible}`]: {
				outlineColor: "currentColor",
				opacity: 1,
			},
		}),
	}),
);

/**
 * The props of a Tab that this component reads, and the `id` and
 * `aria-controls` it sets
 */
interface TabChildProps extends React.AriaAttributes {
	/** The id that a panel's `aria-labelledby` points at */
	id?: string;
	/** MUI's value of the Tab; its index in the bar when it has none */
	value?: unknown;
	/** Set by the Tab itself to keep MUI's pulsating focus ripple */
	disableFocusRipple?: boolean;
}

/**
 * A child of the Tabs that MUI renders, with the value MUI gives it
 */
interface TabEntry {
	/** The element */
	child: React.ReactElement<TabChildProps>;
	/** Its `value`, or its index among the elements when it has none */
	value: unknown;
}

/**
 * The children MUI's `Tabs` renders, in its order, with the value it gives
 * each: the element's `value`, or its index among the elements when it has
 * none.
 * @param children The Tabs' children
 * @returns The elements with their values
 */
const getTabEntries = (children: React.ReactNode): TabEntry[] =>
	React.Children.toArray(children)
		.filter(React.isValidElement<TabChildProps>)
		.map((child, index) => ({
			child,
			value: child.props.value === undefined ? index : child.props.value,
		}));

/**
 * Adds to each Tab the `id` its panel's `aria-labelledby` points at and the
 * `aria-controls` of that panel, and turns MUI's focus ripple off on each Tab
 * that does not set `disableFocusRipple` itself.
 * @param entries The Tabs' children with their values
 * @param url The url of the enclosing Route, for the ids
 * @returns The Tab elements with the props set
 */
const withTabProps = (entries: TabEntry[], url: string): React.ReactNode =>
	entries.map(({ child, value }) =>
		child.type === React.Fragment
			? child
			: React.cloneElement(child, {
					id: getTabId(url, value),
					"aria-controls": getTabPanelId(url, value),
					...(child.props.disableFocusRipple === undefined && {
						disableFocusRipple: true,
					}),
				}),
	);

/**
 * MUI `Tabs` whose selected tab is a segment of the URL (see `children`).
 * A keyboard-focused tab shows a 2px focus ring inside its edge, in the
 * primary color, or in the tab's text color with `textColor="inherit"` (tabs
 * on an AppBar); MUI's own ring when the theme sets `focusVisible`. The
 * theme styles it under `CcRoutedTabs` (`root` is the Tabs root).
 * @param props The props
 */
const RoutedTabs = (props: RoutedTabsProps) => {
	const { pathname, search, hash } = useLocation();
	let { url } = useRouteInfo();
	if (url.endsWith("/")) url = url.substring(0, url.length - 1);
	const navigate = useNavigate();
	const handleChange = useCallback(
		(_evt: React.ChangeEvent<unknown>, value: string) => {
			navigate({
				pathname: url + "/" + value,
				search,
				hash,
			});
		},
		[navigate, url, search, hash],
	);
	const segment =
		pathname
			.substring(url.length)
			.split("/")
			.filter((entry) => entry)[0] ?? "";
	const entries = getTabEntries(props.children);
	const values = entries.map((entry) => entry.value);
	// MUI logs an error for a value no Tab has. With such a segment the default
	// panel (the catch-all) is the one shown, so its Tab is the selected one.
	const current = values.includes(segment)
		? segment
		: values.includes("")
			? ""
			: false;
	return (
		<RoutedTabsRoot {...props} value={current} onChange={handleChange}>
			{withTabProps(entries, url)}
		</RoutedTabsRoot>
	);
};

export default React.memo(RoutedTabs);
