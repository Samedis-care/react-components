import React from "react";

import makeStyles from "@mui/styles/makeStyles";
import combineClassNames from "../../utils/combineClassNames";
import { Styles } from "@mui/styles";
import { Theme } from "@mui/material";
import makeThemeStyles from "../../utils/makeThemeStyles";
import useMultipleStyles from "../../utils/useMultipleStyles";

const useStylesBase = makeStyles(
	(theme) => ({
		fieldSetRoot: {
			padding: "8px",
			borderStyle: "solid",
			borderColor: "lightgrey",
			borderRadius: theme.shape.borderRadius,
			borderWidth: 1,
			position: "relative",
			maxHeight: "inherit",
			height: "100%",
			marginLeft: 0,
			marginRight: 0,
			minWidth: 0,
			width: "100%",
		},
		legend: {
			paddingInlineStart: 5,
			paddingInlineEnd: 5,
		},
		smallLabel: {
			fontSize: "0.75em",
		},
	}),
	{ name: "CcGroupBox" },
);

export type GroupBoxClassKey = keyof ReturnType<typeof useStylesBase>;

export type GroupBoxTheme = Partial<
	Styles<Theme, GroupBoxProps, GroupBoxClassKey>
>;

const useThemeStyles = makeThemeStyles<GroupBoxProps, GroupBoxClassKey>(
	(theme) => theme.componentsCare?.groupBox,
	"CcGroupBox",
);

const useStyles = (props: GroupBoxProps): ReturnType<typeof useStylesBase> => {
	return useMultipleStyles(props, useThemeStyles, useStylesBase);
};

export interface GroupBoxProps {
	/**
	 * The HTML id of the fieldset
	 */
	id?: string;
	/**
	 * The label of the box
	 */
	label: React.ReactNode;
	/**
	 * The label type of the box
	 */
	smallLabel?: boolean;
	/**
	 * Box contents
	 */
	children?: React.ReactNode;
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
}

const GroupBox = (props: GroupBoxProps) => {
	const { id, label, children, smallLabel } = props;
	const classes = useStyles(props);
	return (
		<fieldset id={id} className={classes.fieldSetRoot}>
			{label && (
				<legend
					className={combineClassNames([
						classes.legend,
						smallLabel && classes.smallLabel,
					])}
				>
					{label}
				</legend>
			)}
			{children}
		</fieldset>
	);
};

export default React.memo(GroupBox);
