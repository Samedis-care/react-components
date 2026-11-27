import React from "react";
import {
	Avatar,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	listItemButtonClasses,
	ListItemText,
	styled,
	TypographyProps,
	useThemeProps,
} from "@mui/material";
import Loader from "../Loader";
import Link from "../Routes/Link";
import combineClassNames from "../../utils/combineClassNames";
import focusRing from "../../utils/internal/focusRing";
import visuallyHidden from "../../utils/internal/visuallyHidden";

export interface SignalPortletItemProps {
	/**
	 * The number to show. `null` or `undefined` shows a spinner (loading),
	 * 0 the grey "inactive" avatar, any other number the primary "active"
	 * avatar. A count above 999 shows as "999+" in a smaller font, and
	 * assistive technology gets the full number instead (screen readers read
	 * `count: 1500, text: "Devices"` as "1500 Devices").
	 *
	 * Pass a non-negative integer: negative numbers, NaN and fractions are
	 * shown as given ("-3" and "2.5" in the active avatar, "NaN" in the inactive
	 * one). `count: data?.x` therefore spins until `data` arrives, and also
	 * forever if the field is missing from the loaded data.
	 */
	count: number | null | undefined;
	/**
	 * The label next to the count. With the count it names the row; in a row
	 * with `link` it is part of the link, so it must not contain interactive
	 * content (links, buttons, inputs), which a link cannot hold.
	 */
	text: React.ReactNode;
	/**
	 * Typography props
	 */
	textTypographyProps?: TypographyProps;
	/**
	 * Where the row links to: a path of the app, with an optional `?query` and
	 * `#hash`, as the `to` of the library's `Link`, which needs a
	 * HistoryRouter above it. The row is then a link, an `<a>` with this
	 * href, named by its count and text: a click or Enter navigates in the
	 * app. A click with Ctrl, Meta, Shift or Alt and a middle click are left
	 * to the browser, which opens the href in a new tab or window, as for any
	 * other link. A URL with a scheme ("https://…") makes a plain link that
	 * the browser follows.
	 * Default: none (no link, also for an empty string): the row is a plain,
	 * non-interactive list item.
	 */
	link?: string;
	/**
	 * Class name for the row's `<li>` (the `root` slot), with or without
	 * link. This is also the element that SignalPortlet's `classes.item` and
	 * its theme slot `item` style.
	 */
	className?: string;
	/**
	 * Class names per slot, see {@link SignalPortletItemClassKey}. Each one is
	 * added to its slot's element while the row renders it: `root`,
	 * `listAvatar` and `listText` always, one of `itemColorLoading`,
	 * `itemColorActive` and `itemColorInactive` for the current count,
	 * `countCapped` and `countFull` for a count above 999, and `rootBtn` in a
	 * row with `link`.
	 */
	classes?: Partial<Record<SignalPortletItemClassKey, string>>;
}

const ListAvatar = styled(ListItemAvatar, {
	name: "CcSignalPortletItem",
	slot: "listAvatar",
})({});
const AvatarLoading = styled(Avatar, {
	name: "CcSignalPortletItem",
	slot: "itemColorLoading",
})({
	backgroundColor: "transparent",
});
const AvatarActive = styled(Avatar, {
	name: "CcSignalPortletItem",
	slot: "itemColorActive",
})(({ theme }) => ({
	color: theme.palette.primary.contrastText,
	backgroundColor: theme.palette.primary.main,
}));
const AvatarInactive = styled(Avatar, {
	name: "CcSignalPortletItem",
	slot: "itemColorInactive",
})(({ theme }) => ({
	// the grey of MUI's Avatar without an image, with the text color for it:
	// the count is content, not a disabled control, and needs 4.5:1. The dark
	// palette's colors apply in the dark scheme of a theme of CSS variables
	// too. A scheme sets only these properties, so a theme's color and
	// backgroundColor for this slot apply in every scheme
	"--cc-signal-portlet-inactive-color": theme.palette.getContrastText(
		theme.palette.grey[400],
	),
	"--cc-signal-portlet-inactive-background": theme.palette.grey[400],
	...theme.applyStyles("dark", {
		"--cc-signal-portlet-inactive-color": theme.palette.getContrastText(
			theme.palette.grey[600],
		),
		"--cc-signal-portlet-inactive-background": theme.palette.grey[600],
	}),
	color: "var(--cc-signal-portlet-inactive-color)",
	backgroundColor: "var(--cc-signal-portlet-inactive-background)",
}));
const CountCapped = styled("span", {
	name: "CcSignalPortletItem",
	slot: "countCapped",
})({
	// "999+" in the avatar's font size is wider than the 40px avatar
	fontSize: "0.7em",
});
const CountFull = styled("span", {
	name: "CcSignalPortletItem",
	slot: "countFull",
})(visuallyHidden);
const ListText = styled(ListItemText, {
	name: "CcSignalPortletItem",
	slot: "listText",
})({});
const ListRoot = styled(ListItem, {
	name: "CcSignalPortletItem",
	slot: "root",
})({});
const ListRootButton = styled(ListItemButton, {
	name: "CcSignalPortletItem",
	slot: "rootBtn",
})(({ theme }) => ({
	// MUI marks the keyboard-focused row with a faint tint only, which forced
	// colors drop; inside the row, which spans the card from edge to edge
	[`&.${listItemButtonClasses.focusVisible}`]: focusRing(theme, -2),
})) as typeof ListItemButton; // styled() drops the typing of `component`

/**
 * Slots of a SignalPortlet row, for an item's `classes` and for the theme's
 * `components.CcSignalPortletItem.styleOverrides`:
 * - `root`: the ListItem (`<li>`) of every row. A row with link has no
 *   padding here (MUI's `disablePadding`), its ListItemButton has it.
 * - `rootBtn`: the ListItemButton inside the `<li>` of a row with link,
 *   rendered as the link itself: an `<a>` with the link's href. Keyboard
 *   focus draws a 2px outline in `palette.primary.main` inside its edges,
 *   or the ring of the theme's `focusVisible` option when the theme sets
 *   one.
 * - `listAvatar`: the ListItemAvatar around the count
 * - `itemColorLoading`, `itemColorActive`, `itemColorInactive`: the 40px
 *   Avatar while the count is `null` or `undefined`, when it is non-zero, and
 *   when it is 0. The active one is `palette.primary.main` with its
 *   `contrastText`. The inactive one is `palette.grey[400]`, `grey[600]` in a
 *   dark palette or the dark scheme of a theme of CSS variables, with
 *   `palette.getContrastText` of that grey as its text color; a `color` and
 *   `backgroundColor` set for it in the theme apply in every scheme
 * - `countCapped`: the visible "999+" of a count above 999, hidden from
 *   assistive technology
 * - `countFull`: the visually hidden full number of a count above 999, read
 *   by assistive technology
 * - `listText`: the ListItemText
 */
export type SignalPortletItemClassKey =
	| "listAvatar"
	| "itemColorLoading"
	| "itemColorActive"
	| "itemColorInactive"
	| "countCapped"
	| "countFull"
	| "listText"
	| "root"
	| "rootBtn";

/** The highest count shown as it is; higher counts show as "999+" */
const MAX_COUNT = 999;

const SignalPortletItem = (inProps: SignalPortletItemProps) => {
	const props = useThemeProps({ props: inProps, name: "CcSignalPortletItem" });
	const { count, link, text, textTypographyProps, className, classes } = props;

	const AvatarComponent =
		count == null ? AvatarLoading : count ? AvatarActive : AvatarInactive;
	const avatarClass: string | undefined = classes
		? count == null
			? classes.itemColorLoading
			: count
				? classes.itemColorActive
				: classes.itemColorInactive
		: undefined;

	const content = (
		<>
			<ListAvatar className={classes?.listAvatar}>
				<AvatarComponent className={avatarClass}>
					{count == null ? (
						<Loader />
					) : count > MAX_COUNT ? (
						<>
							<CountCapped aria-hidden className={classes?.countCapped}>
								{`${MAX_COUNT}+`}
							</CountCapped>
							<CountFull className={classes?.countFull}>
								{count.toString()}
							</CountFull>
						</>
					) : (
						count.toString()
					)}
				</AvatarComponent>
			</ListAvatar>
			<ListText
				className={classes?.listText}
				slotProps={{ primary: textTypographyProps }}
			>
				{text}
			</ListText>
		</>
	);
	// every row is a list item; a linked row puts its link inside, as in
	// MUI's ListItem disablePadding + ListItemButton pattern
	return (
		<ListRoot
			disablePadding={!!link}
			className={combineClassNames([className, classes?.root])}
		>
			{link ? (
				<ListRootButton component={Link} to={link} className={classes?.rootBtn}>
					{content}
				</ListRootButton>
			) : (
				content
			)}
		</ListRoot>
	);
};

export default React.memo(SignalPortletItem);
