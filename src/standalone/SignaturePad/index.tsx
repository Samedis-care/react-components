import React, { useState } from "react";
import { makeStyles, Tooltip } from "@material-ui/core";
import { Info as InfoIcon } from "@material-ui/icons";
import { SignIcon } from "../../standalone";
import SignPadDialog from "./SignPadDialog";
import ccI18n from "../../i18n";

export interface SignaturePadCanvasProps {
	/**
	 * The text for info icon
	 */
	infoText?: React.ReactNode;
	/**
	 * The props used to draw HTML canvas
	 */
	canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
	/**
	 * Boolean flag to clear signature
	 */
	clearOnResize?: boolean;
	/**
	 * Use to change signature pen color
	 */
	penColor?: string;
	/**
	 * Boolean flag to disable edit signature
	 */
	disabled?: boolean;
	/**
	 * The base64 string of signature
	 */
	signature: string;
	/**
	 * Callback method which returns signature base64 string
	 */
	setSignature?: (imageURL: string) => void;
	/**
	 * Blur event
	 */
	onBlur?: React.FocusEventHandler<HTMLDivElement>;
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
}

const useStyles = makeStyles((theme) => ({
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
		signature,
		setSignature,
		disabled,
		infoText,
		clearOnResize,
		canvasProps,
		penColor,
		onBlur,
	} = props;
	const classes = useStyles(props);
	const [dialog, setDialog] = useState(false);

	const handleSignPad = React.useCallback(() => {
		if (!disabled) setDialog(!dialog);
	}, [dialog, disabled]);

	return (
		<div onBlur={onBlur}>
			<div
				className={classes.signPadDiv}
				onClick={handleSignPad}
				style={{ backgroundColor: signature ? "white" : "lightgray" }}
			>
				<div className={classes.textDiv}>
					<SignIcon color={signature ? "primary" : "disabled"} />
					{signature ? (
						<div className={classes.imageDiv}>
							<img src={signature} />
						</div>
					) : (
						<span className={classes.signText}>
							{ccI18n.t("standalone.signature-pad.sign-here")}
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
				setSignature={setSignature}
				signature={signature}
				handleSignPad={handleSignPad}
			/>
		</div>
	);
};

export default React.memo(SignaturePadCanvas);
