import React, { useCallback } from "react";
import {
	Avatar,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	styled,
	TypographyProps,
	useThemeProps,
} from "@mui/material";
import Loader from "../Loader";
import useNavigate from "../Routes/useNavigate";
import combineClassNames from "../../utils/combineClassNames";

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
	 * The text of the portlet item
	 */
	text: React.ReactNode;
	/**
	 * Typography props
	 */
	textTypographyProps?: TypographyProps;
	/**
	 * The url the portlet item links to onClick
	 */
	link?: string;
	/**
	 * custom CSS classes to apply to root/rootBtn
	 */
	className?: string;
	/**
	 * Custom CSS styles
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
	color: theme.palette.getContrastText(theme.palette.action.disabled),
	backgroundColor: theme.palette.action.disabled,
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
})({
	// visually hidden, as MUI's visuallyHidden
	border: 0,
	clipPath: "inset(50%)",
	height: 1,
	margin: -1,
	overflow: "hidden",
	padding: 0,
	position: "absolute",
	whiteSpace: "nowrap",
	width: 1,
});
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
})({});

/**
 * Slots of a SignalPortlet row, for an item's `classes` and for the theme's
 * `components.CcSignalPortletItem.styleOverrides`:
 * - `root`: the ListItem (`<li>`) of a row without link
 * - `rootBtn`: the ListItemButton (a `div` with role button) of a row with
 *   link
 * - `listAvatar`: the ListItemAvatar around the count
 * - `itemColorLoading`, `itemColorActive`, `itemColorInactive`: the 40px
 *   Avatar while the count is `null` or `undefined`, when it is non-zero, and
 *   when it is 0
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
	const navigate = useNavigate();

	const handleClick = useCallback(() => {
		if (link) {
			navigate(link);
		}
	}, [navigate, link]);

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
			<ListText slotProps={{ primary: textTypographyProps }}>{text}</ListText>
		</>
	);
	return link ? (
		<ListRootButton
			onClick={handleClick}
			className={combineClassNames([className, classes?.rootBtn])}
		>
			{content}
		</ListRootButton>
	) : (
		<ListRoot className={combineClassNames([className, classes?.root])}>
			{content}
		</ListRoot>
	);
};

export default React.memo(SignalPortletItem);
