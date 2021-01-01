import React, { useState } from "react";
import { makeStyles, Tooltip } from "@material-ui/core";
import { Info as InfoIcon, Edit as EditIcon } from "@material-ui/icons";
import SignPadDialog from "./SignPadDialog";
import ccI18n from "../../i18n";

export interface SignaturePadCanvasProps {
	infoText?: React.ReactNode;
	canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
	clearOnResize?: boolean;
	penColor?: string;
}

const useClasses = makeStyles((theme) => ({
	signPadDiv: {
		position: "relative",
		cursor: "pointer",
		borderBottom: "1px dotted",
		height: 150,
		width: 400,
		color: theme.palette.grey[700],
	},
	textDiv: {
		margin: 5,
		position: "absolute",
		bottom: 0,
		marginLeft: 125,
	},
	editIcon: {},
	signText: {},
	infoIcon: {},
}));

const SignaturePadCanvas = (props: SignaturePadCanvasProps) => {
	const { infoText, clearOnResize, canvasProps, penColor } = props;
	const classes = useClasses();
	const [imageURL, setImageURL] = useState("");
	const [dialog, setDailog] = useState(false);

	const handleSignPad = () => {
		setDailog(!dialog);
	};

	return (
		<div>
			<div
				className={classes.signPadDiv}
				onClick={handleSignPad}
				style={{ backgroundColor: imageURL ? "white" : "lightgray" }}
			>
				<div className={classes.textDiv}>
					<EditIcon color={imageURL ? "primary" : "disabled"} />
					{imageURL ? (
						<div style={{ border: "1px solid" }}>
							<img src={imageURL} />
						</div>
					) : (
						<span className={classes.signText}>
							{ccI18n.t("signature-pad.sign-here")}
						</span>
					)}
					{infoText && (
						<Tooltip title={infoText} className={classes.infoIcon}>
							<InfoIcon color={"disabled"} />
						</Tooltip>
					)}
				</div>
			</div>
			<SignPadDialog
				openDialog={dialog}
				clearOnResize={clearOnResize}
				canvasProps={canvasProps}
				penColor={penColor}
				setImageURL={setImageURL}
				handleSignPad={handleSignPad}
			/>
		</div>
	);
};

export default React.memo(SignaturePadCanvas);
