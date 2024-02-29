import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import makeStyles from "@mui/styles/makeStyles";
import { ClassNameMap } from "@mui/styles/withStyles";
import {
	Avatar,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	Theme,
} from "@mui/material";
import type { SignalPortletColorConfig } from "./index";
import Loader from "../Loader";
import { Styles } from "@mui/styles";
import makeThemeStyles from "../../utils/makeThemeStyles";

export interface SignalPortletItemDef {
	/**
	 * The count to show or null/undefined to signal loading
	 */
	count: number | null | undefined;
	/**
	 * The text of the portlet item
	 */
	text: React.ReactNode;
	/**
	 * The url the portlet item links to onClick
	 */
	link?: string;
	/**
	 * Custom CSS styles
	 */
	classes?: Partial<ClassNameMap<keyof ReturnType<typeof useStyles>>>;
}

export type SignalPortletItemProps = SignalPortletItemDef &
	SignalPortletColorConfig;

const useStyles = makeStyles(
	(theme) => ({
		itemColorLoading: {
			backgroundColor: "transparent",
		},
		itemColorActive: (props: SignalPortletItemProps) => ({
			color: theme.palette.getContrastText(props.colorPresent),
			backgroundColor: props.colorPresent,
		}),
		itemColorInactive: (props: SignalPortletItemProps) => ({
			color: theme.palette.getContrastText(props.colorNotPresent),
			backgroundColor: props.colorNotPresent,
		}),
		root: {},
		listAvatar: {},
		listText: {},
		listTextPrimary: {},
	}),
	{ name: "CcSignalPortletItem" },
);

export type SignalPortletItemClassKey = keyof ReturnType<typeof useStyles>;

export type SignalPortletItemTheme = Partial<
	Styles<Theme, SignalPortletItemProps, SignalPortletItemClassKey>
>;

const useThemeStyles = makeThemeStyles<
	SignalPortletItemProps,
	SignalPortletItemClassKey
>(
	(theme) => theme.componentsCare?.signalPortlet?.item,
	"CcSignalPortletItem",
	useStyles,
);

const SignalPortletItem = (props: SignalPortletItemProps) => {
	const { count, link, text } = props;
	const classes = useThemeStyles(props);
	const navigate = useNavigate();

	const handleClick = useCallback(() => {
		if (link) {
			navigate(link);
		}
	}, [navigate, link]);

	const counterClass =
		count == null
			? classes.itemColorLoading
			: count
				? classes.itemColorActive
				: classes.itemColorInactive;

	const content = (
		<>
			<ListItemAvatar className={classes.listAvatar}>
				<Avatar className={counterClass}>
					{count == null ? <Loader /> : count.toString()}
				</Avatar>
			</ListItemAvatar>
			<ListItemText
				className={classes.listText}
				primaryTypographyProps={{ className: classes.listTextPrimary }}
			>
				{text}
			</ListItemText>
		</>
	);
	return link ? (
		<ListItemButton onClick={handleClick} className={classes.root}>
			{content}
		</ListItemButton>
	) : (
		<ListItem className={classes.root}>{content}</ListItem>
	);
};

export default React.memo(SignalPortletItem);
