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
	 * The count to show or null/undefined to signal loading
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

export type SignalPortletItemClassKey =
	| "listAvatar"
	| "itemColorLoading"
	| "itemColorActive"
	| "itemColorInactive"
	| "listText"
	| "root"
	| "rootBtn";

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
					{count == null ? <Loader /> : Math.min(count, 999).toString()}
				</AvatarComponent>
			</ListAvatar>
			<ListText primaryTypographyProps={textTypographyProps}>{text}</ListText>
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
