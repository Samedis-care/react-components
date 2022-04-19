import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { ClassNameMap } from "@material-ui/styles/withStyles";
import {
	Avatar,
	ListItem,
	ListItemAvatar,
	ListItemText,
} from "@material-ui/core";
import { SignalPortletColorConfig } from "./index";

export interface SignalPortletItemDef {
	/**
	 * The count to show
	 */
	count: number;
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
	}),
	{ name: "CcSignalPortletItem" }
);

const SignalPortletItem = (props: SignalPortletItemProps) => {
	const { count, link, text } = props;
	const classes = useStyles(props);
	const navigate = useNavigate();

	const handleClick = useCallback(() => {
		if (link) {
			navigate(link);
		}
	}, [navigate, link]);

	const counterClass = count
		? classes.itemColorActive
		: classes.itemColorInactive;

	return (
		<ListItem
			button={
				!!link as true /* https://github.com/mui-org/material-ui/issues/14971 */
			}
			onClick={handleClick}
			className={classes.root}
		>
			<ListItemAvatar className={classes.listAvatar}>
				<Avatar className={counterClass}>{count.toString()}</Avatar>
			</ListItemAvatar>
			<ListItemText className={classes.listText}>{text}</ListItemText>
		</ListItem>
	);
};

export default React.memo(SignalPortletItem);
