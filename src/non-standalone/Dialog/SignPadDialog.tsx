import React, { useRef, useState } from "react";
import {
	Button,
	Dialog,
	DialogActions,
	makeStyles,
	IconButton,
	Typography,
} from "@material-ui/core";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { Close } from "@material-ui/icons";
import SignaturePad from "react-signature-canvas";
import ccI18n from "../../i18n";
import { useDialogContext } from "../../framework";
import { IDialogConfigSign } from "./Types";
export interface SignPadDialogProps extends IDialogConfigSign {
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
}

const useStyles = makeStyles(
	(theme) => ({
		root: {
			margin: 0,
			padding: theme.spacing(2),
		},
		closeButton: {
			position: "absolute",
			right: theme.spacing(1),
			top: theme.spacing(1),
			color: theme.palette.grey[500],
		},
		signDiv: {
			border: "1px dotted",
			marginLeft: 10,
			marginRight: 10,
		},
		imageDiv: {
			width: 300,
			height: 150,
			display: "table-cell",
			verticalAlign: "middle",
			textAlign: "center",
		},
	}),
	{ name: "CcSignPadDialog" }
);

const SignPadDialog = (props: SignPadDialogProps) => {
	const { disabled, penColor, setSignature, signature, ...canvasProps } = props;
	const [resetCanvas, setResetCanvas] = useState(!!signature);
	const [, popDialog] = useDialogContext();
	const signCanvas = useRef<SignaturePad>(null);
	const classes = useStyles(props);
	const clearCanvas = React.useCallback(() => {
		if (signCanvas.current) {
			signCanvas.current.clear();
		}
		if (setSignature) setSignature("");
		setResetCanvas(false);
	}, [setSignature]);

	const saveCanvas = React.useCallback(() => {
		if (signCanvas.current && !signCanvas.current.isEmpty()) {
			const signature = signCanvas.current
				.getTrimmedCanvas()
				.toDataURL("image/png");
			if (setSignature) setSignature(signature);
		}
		popDialog();
	}, [setSignature, popDialog]);

	const closeCanvas = () => popDialog();
	return (
		<Dialog
			open={!disabled}
			maxWidth="sm"
			disableBackdropClick
			onClose={closeCanvas}
		>
			<MuiDialogTitle
				id="sign-pad-dialog"
				disableTypography
				className={classes.root}
			>
				<Typography variant="h6">
					{ccI18n.t("standalone.signature-pad.dialog.title")}
				</Typography>
				{closeCanvas && (
					<IconButton
						aria-label="Close"
						className={classes.closeButton}
						onClick={closeCanvas}
					>
						<Close />
					</IconButton>
				)}
			</MuiDialogTitle>
			<div className={classes.signDiv}>
				{!resetCanvas ? (
					<SignaturePad
						ref={signCanvas}
						penColor={penColor || "blue"}
						{...canvasProps}
					/>
				) : (
					<div className={classes.imageDiv}>
						<img src={signature} alt="Sign" />
					</div>
				)}
			</div>
			<DialogActions>
				<Button onClick={saveCanvas} color="primary">
					{ccI18n.t("standalone.signature-pad.dialog.save-changes")}
				</Button>
				<Button onClick={clearCanvas} color="secondary">
					{ccI18n.t("standalone.signature-pad.dialog.reset")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export const SignDialog = React.memo(SignPadDialog);
