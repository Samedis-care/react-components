import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import Loader from "../Loader";

const useStyles = makeStyles(
	{
		root: {
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 9999,
			backgroundColor: "rgba(255,255,255,.3)",
			transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) 1000ms",
		},
	},
	{ name: "CcFormLoaderOverlay" }
);

export interface FormLoaderOverlayProps {
	visible: boolean;
}

const FormLoaderOverlay = (props: FormLoaderOverlayProps) => {
	const classes = useStyles();

	return (
		<div
			className={classes.root}
			style={
				props.visible
					? { visibility: "visible", opacity: 1 }
					: { visibility: "hidden", opacity: 0 }
			}
		>
			{props.visible && <Loader />}
		</div>
	);
};

export default React.memo(FormLoaderOverlay);
