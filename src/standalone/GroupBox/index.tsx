import React, { useRef, useEffect } from "react";
import { makeStyles, InputLabel } from "@material-ui/core";

const useStyles = makeStyles(
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
			maxWidth: "100%",
			whiteSpace: "nowrap",
		},
	}),
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
	const inputLabelRef = useRef<HTMLLabelElement>(null);
	useEffect(() => {
		if (!smallLabel) return;
		if (inputLabelRef.current) {
			const elem = inputLabelRef.current;
			const parentElem = elem.parentElement;
			if (parentElem) {
				parentElem.style.maxWidth =
					(elem.getBoundingClientRect().width + 5).toString() + "px";
			}
		}
	}, [smallLabel]);
	return (
		<fieldset id={id} className={classes.fieldSetRoot}>
			{smallLabel
				? label && (
						<legend className={classes.smallLabel}>
							<InputLabel shrink ref={inputLabelRef}>
								{label}
							</InputLabel>
						</legend>
				  )
				: label && <legend className={classes.legend}>{label}</legend>}

			{children}
		</fieldset>
	);
};

export default React.memo(GroupBox);
