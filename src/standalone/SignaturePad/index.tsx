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
	disabled?: boolean;
	setSignature?: string;
	getSignature?: (imageURL: string) => void;
}

const useClasses = makeStyles((theme) => ({
	signPadDiv: {
		position: "relative",
		cursor: "pointer",
		borderBottom: "1px dotted",
		height: 150,
		width: 400,
		color: theme.palette.grey[700],
		display: "inline-block",
	},
	textDiv: {
		position: "absolute",
		display: "inline-block",
		bottom: 0,
		left: 5,
	},
	imageDiv: {
		display: "inline-block",
		margin: "0px 20px",
	},
	signText: {
		display: "inline-block",
		marginLeft: 10,
	},
	infoDiv: {
		position: "absolute",
		right: 5,
		bottom: 0,
	},
}));

const SignaturePadCanvas = (props: SignaturePadCanvasProps) => {
	const {
		setSignature,
		getSignature,
		disabled,
		infoText,
		clearOnResize,
		canvasProps,
		penColor,
	} = props;
	const classes = useClasses();
	const [imageURL, setImageURL] = useState(setSignature || "");
	const [dialog, setDialog] = useState(false);

	const handleSignPad = () => {
		if (!disabled) setDialog(!dialog);
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
						<div className={classes.imageDiv}>
							<img src={imageURL} />
						</div>
					) : (
						<span className={classes.signText}>
							{ccI18n.t("signature-pad.sign-here")}
						</span>
					)}
				</div>
				<div className={classes.infoDiv}>
					{infoText && (
						<Tooltip title={infoText}>
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
				getSignature={getSignature}
				imageURL={imageURL}
				setImageURL={setImageURL}
				handleSignPad={handleSignPad}
			/>
		</div>
	);
};

export default React.memo(SignaturePadCanvas);
