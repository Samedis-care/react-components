import React, { memo } from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
	fieldSetRoot: {
		padding: "0 8px",
		borderStyle: "dotted",
		borderColor: "lightgrey",
		borderRadius: 4,
		borderWidth: 1,
	},
});

export interface GroupBoxProps {
	id?: string;
	label: React.ReactNode;
	children?: React.ReactNode;
}

const GroupBox = (props: GroupBoxProps) => {
	const { id, label, children } = props;
	const classes = useStyles();

	return (
		<fieldset id={id} className={classes.fieldSetRoot}>
			<legend>{label}</legend>
			{children}
		</fieldset>
	);
};
export default memo(GroupBox);
