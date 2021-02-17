import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(
	{
		fieldSetRoot: {
			padding: "8px",
			borderStyle: "solid",
			borderColor: "lightgrey",
			borderRadius: 4,
			borderWidth: 1,
			position: "relative",
			maxHeight: "inherit",
			height: "100%",
			marginLeft: 0,
			marginRight: 0,
		},
		legend: {
			paddingInlineStart: 5,
			paddingInlineEnd: 5,
		},
	},
	{ name: "CcGroupBox" }
);

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
	 * Box contents
	 */
	children?: React.ReactNode;
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
}

const GroupBox = (props: GroupBoxProps) => {
	const { id, label, children } = props;
	const classes = useStyles(props);

	return (
		<fieldset id={id} className={classes.fieldSetRoot}>
			{label && <legend className={classes.legend}>{label}</legend>}
			{children}
		</fieldset>
	);
};

export default React.memo(GroupBox);
