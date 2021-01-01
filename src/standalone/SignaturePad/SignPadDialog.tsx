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
	setImageURL?: (url: string) => void;
	handleSignPad: () => void;
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
}));

const SignPadDialog = (props: SignPadDialogProps) => {
	const {
		openDialog,
		clearOnResize,
		penColor,
		handleSignPad,
		setImageURL,
		...canvasProps
	} = props;
	const signCanvas = useRef<HTMLCanvasElement>(null);
	const classes = useClasses();

	const clearCanvas = () => {
		if (signCanvas.current) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			signCanvas.current.clear();
			if (setImageURL) setImageURL("");
		}
	};

	const saveCanvas = () => {
		if (signCanvas.current) {
			// const imageURL = signCanvas.current
			// 	.getTrimmedCanvas()
			// 	.toDataURL("image/png") as string;
			// if (setImageURL) setImageURL(imageURL);
			handleSignPad();
		}
	};

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
					{ccI18n.t("signature-pad.dialog.title")}
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
				<SignaturePad
					ref={signCanvas as React.MutableRefObject<any>}
					penColor={penColor || "blue"}
					clearOnResize={clearOnResize}
					{...canvasProps}
				/>
			</div>
			<DialogActions>
				<Button onClick={saveCanvas} color="primary">
					{ccI18n.t("signature-pad.dialog.save-changes")}
				</Button>
				<Button onClick={clearCanvas} color="secondary">
					{ccI18n.t("signature-pad.dialog.reset")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default React.memo(SignPadDialog);
