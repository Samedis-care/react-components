import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
	outlined: {
		float: "left",
		backgroundColor: "#cce1f6",
		padding: 20,
		borderRadius: 40,
		borderColor: "#cce1f6",
	},
	buttonContainer: {
		margin: "0px 10px",
	},
});

export interface FormButtonsProps {
	/**
	 * Action buttons (used on form)
	 */
	children: NonNullable<React.ReactNode[]>;
}

const FormButtons = (props: FormButtonsProps) => {
	const classes = useStyles();
	const children =
		"length" in props.children ? props.children : [props.children];

	if (!children) throw new Error("Atleast one button required");

	return (
		<div className={classes.outlined}>
			{children.map((child: React.ReactNode, index: number) => {
				return (
					<span className={classes.buttonContainer} key={index}>
						{child}
					</span>
				);
			})}
		</div>
	);
};

export default React.memo(FormButtons);
