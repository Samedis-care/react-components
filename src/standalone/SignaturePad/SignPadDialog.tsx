import React, { useRef } from "react";
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

export interface SignPadDialogProps {
	clearOnResize?: boolean;
	openDialog: boolean;
	canvasProps?: React.DetailedHTMLProps<
		React.CanvasHTMLAttributes<HTMLCanvasElement>,
		HTMLCanvasElement
	>;
	penColor?: string;
	signature: string;
	handleSignPad: () => void;
	setSignature?: (url: string) => void;
}

const useClasses = makeStyles((theme) => ({
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
}));

const SignPadDialog = (props: SignPadDialogProps) => {
	const {
		openDialog,
		clearOnResize,
		penColor,
		handleSignPad,
		setSignature,
		signature,
		...canvasProps
	} = props;
	const signCanvas = useRef<SignaturePad>(null);
	const classes = useClasses();
	const clearCanvas = React.useCallback(() => {
		if (signCanvas.current) {
			signCanvas.current.clear();
		}
		if (setSignature) setSignature("");
	}, [setSignature]);

	const saveCanvas = React.useCallback(() => {
		if (signCanvas.current) {
			const signature = signCanvas.current
				.getTrimmedCanvas()
				.toDataURL("image/png");
			if (setSignature) setSignature(signature);
			handleSignPad();
		}
	}, [setSignature, handleSignPad]);

	const closeCanvas = () => handleSignPad();

	return (
		<Dialog
			open={openDialog}
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
				{!signature && (
					<SignaturePad
						ref={signCanvas}
						penColor={penColor || "blue"}
						clearOnResize={clearOnResize}
						{...canvasProps}
					/>
				)}
				{signature && (
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

export default React.memo(SignPadDialog);
