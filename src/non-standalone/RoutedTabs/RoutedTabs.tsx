import React, { useCallback } from "react";
import {
	buttonBaseClasses,
	styled,
	tabClasses,
	Tabs,
	tabsClasses,
	TabsProps,
	useThemeProps,
} from "@mui/material";
import useLocation from "../../standalone/Routes/useLocation";
import { useRouteInfo } from "../../standalone";
import useNavigate from "../../standalone/Routes/useNavigate";
import focusRing from "../../utils/internal/focusRing";
import combineClassNames from "../../utils/combineClassNames";
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
	 * url and the value. See `linkTabsToPanels` for a bar without a wrapper.
	 */
	children: React.ReactNode;
	/**
	 * Whether a `RoutedTabPanelWrapper` under the same Route renders this bar's
	 * panels. When `true` (the default) each Tab gets the `id` and
	 * `aria-controls` of its panel. Set `false` for a bar that only navigates
	 * (no panels, or panels not rendered by the wrapper): the Tabs then get
	 * neither, so no `aria-controls` points at an element that does not exist.
	 * The wrapper itself still gives its panel an `id` and `aria-labelledby`;
	 * for a panel of your own, keep the default and set
	 * `id={getTabPanelId(url, value)}` and
	 * `aria-labelledby={getTabId(url, value)}` on it.
	 */
	linkTabsToPanels?: boolean;
	/**
	 * How the tabs share the bar. Default: `"scrollable"`, unlike MUI's
	 * `Tabs`, so that every tab can be reached at any width (a phone, or 400%
	 * zoom).
	 * - `"scrollable"`: each tab as wide as its label, starting at the bar's
	 *   start edge. When the tabs do not fit, the bar scrolls (swipe, the
	 *   arrow keys, or the scroll buttons, see `scrollButtons` and
	 *   `allowScrollButtonsMobile`).
	 * - `"fullWidth"`: the tabs share the bar's width equally, as in MUI.
	 *   A tab never gets narrower than its longest word: when the tabs do not
	 *   fit, the bar scrolls like the `"scrollable"` one instead of cutting
	 *   them off. A vertical bar keeps MUI's `fullWidth`.
	 * - `"standard"`: MUI's fixed bar. It does not scroll, so tabs that do not
	 *   fit are cut off and cannot be swiped into view: only for a bar that
	 *   fits at 320px.
	 *
	 * A theme sets another default under `CcRoutedTabs.defaultProps`. This
	 * component always passes `variant`, `centered` and
	 * `allowScrollButtonsMobile` to MUI's `Tabs`, so the theme's
	 * `MuiTabs.defaultProps` for those three do not reach it.
	 */
	variant?: TabsProps["variant"];
	/**
	 * Centers the tabs while they fit; when they do not, they start at the
	 * bar's start edge, so the first one is not cut off. Works with every
	 * variant, also with the default `"scrollable"` (MUI's own `centered` takes
	 * effect only with `"standard"`). Default: `false`. The list has no
	 * `MuiTabs-centered` class.
	 */
	centered?: boolean;
	/**
	 * Shows the scroll buttons of a scrolling bar on phones (below `sm`) too,
	 * so that its tabs can be scrolled without swiping and it shows that more
	 * tabs exist. Default: `true`, unlike MUI's `Tabs`. With
	 * `scrollButtons="auto"` (MUI's default) they appear only while the tabs
	 * do not fit; `scrollButtons={false}` hides them at every width.
	 */
	allowScrollButtonsMobile?: boolean;
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
 *
 * `CcRoutedTabs-centered` centers the tabs only while they fit (`safe
 * center`), so overflow goes to the end edge, where the bar scrolls, and not
 * past the start edge, where nothing can scroll to it.
 * `CcRoutedTabs-fullWidth` is a scrollable bar whose tabs share its width
 * equally, as MUI's `fullWidth` tabs do, but no tab gets narrower than its
 * longest word.
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
		[`&.CcRoutedTabs-centered .${tabsClasses.list}`]: {
			justifyContent: "safe center",
		},
		[`&.CcRoutedTabs-fullWidth .${tabClasses.root}`]: {
			flexGrow: 1,
			flexBasis: 0,
			maxWidth: "none",
			minWidth: "min-content",
		},
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
 * @param linkTabsToPanels Whether the Tabs get the `id` and `aria-controls`
 * @returns The Tab elements with the props set
 */
const withTabProps = (
	entries: TabEntry[],
	url: string,
	linkTabsToPanels: boolean,
): React.ReactNode =>
	entries.map(({ child, value }) =>
		child.type === React.Fragment
			? child
			: React.cloneElement(child, {
					...(linkTabsToPanels && {
						id: getTabId(url, value),
						"aria-controls": getTabPanelId(url, value),
					}),
					...(child.props.disableFocusRipple === undefined && {
						disableFocusRipple: true,
					}),
				}),
	);

/**
 * MUI `Tabs` whose selected tab is a segment of the URL (see `children`).
 * Opening a tab pushes its URL and keeps the scroll position of the page
 * (`preventScrollReset`, see `useNavigate`): the bar, the focused tab and the
 * panel stay where the user is.
 * The bar scrolls when its tabs do not fit, with scroll buttons also on
 * phones (see `variant`, `centered` and `allowScrollButtonsMobile`), so every
 * tab can be reached at 320px.
 * A keyboard-focused tab shows a 2px focus ring inside its edge, in the
 * primary color, or in the tab's text color with `textColor="inherit"` (tabs
 * on an AppBar); MUI's own ring when the theme sets `focusVisible`. The
 * theme sets default props under `CcRoutedTabs.defaultProps` and styles it
 * under `CcRoutedTabs` (`root` is the Tabs root).
 * @param inProps The props
 */
const RoutedTabs = (inProps: RoutedTabsProps) => {
	const props = useThemeProps({ props: inProps, name: "CcRoutedTabs" });
	const {
		linkTabsToPanels = true,
		variant = "scrollable",
		centered = false,
		allowScrollButtonsMobile = true,
		className,
		onFocus,
		...tabsProps
	} = props;
	// MUI's fullWidth bar never scrolls: a scrollable one whose tabs grow
	const fullWidth =
		variant === "fullWidth" && tabsProps.orientation !== "vertical";
	const { pathname, search, hash } = useLocation();
	let { url } = useRouteInfo();
	if (url.endsWith("/")) url = url.substring(0, url.length - 1);
	const navigate = useNavigate();
	const handleChange = useCallback(
		(_evt: React.ChangeEvent<unknown>, value: string) => {
			navigate(
				{
					pathname: url + "/" + value,
					search,
					hash,
				},
				// the user stays on the page, with the bar and the focused tab in view
				{ preventScrollReset: true },
			);
		},
		[navigate, url, search, hash],
	);
	// The browser scrolls a focused tab only until part of it shows, so the
	// edge of the bar or a scroll button could cut it off. (jsdom has no
	// scrollIntoView.)
	const handleFocus = useCallback(
		(evt: React.FocusEvent<HTMLDivElement>) => {
			onFocus?.(evt);
			if (evt.target.getAttribute("role") === "tab") {
				evt.target.scrollIntoView?.({ block: "nearest", inline: "nearest" });
			}
		},
		[onFocus],
	);
	const segment =
		pathname
			.substring(url.length)
			.split("/")
			.filter((entry) => entry)[0] ?? "";
	const entries = getTabEntries(tabsProps.children);
	const values = entries.map((entry) => entry.value);
	// MUI logs an error for a value no Tab has. With such a segment the default
	// panel (the catch-all) is the one shown, so its Tab is the selected one.
	const current = values.includes(segment)
		? segment
		: values.includes("")
			? ""
			: false;
	return (
		<RoutedTabsRoot
			{...tabsProps}
			className={combineClassNames([
				className,
				centered && "CcRoutedTabs-centered",
				fullWidth && "CcRoutedTabs-fullWidth",
			])}
			variant={fullWidth ? "scrollable" : variant}
			// centered by the class above, which also works with "scrollable"
			centered={false}
			allowScrollButtonsMobile={allowScrollButtonsMobile}
			value={current}
			onChange={handleChange}
			onFocus={handleFocus}
		>
			{withTabProps(entries, url, linkTabsToPanels)}
		</RoutedTabsRoot>
	);
};

export default React.memo(RoutedTabs);
