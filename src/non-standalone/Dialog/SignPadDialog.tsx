import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Button,
	Dialog,
	DialogActions,
	IconButton,
	Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import MuiDialogTitle from "@mui/material/DialogTitle";
import { Close } from "@mui/icons-material";
import SignaturePad from "react-signature-canvas";
import { useDialogContext } from "../../framework";
import { IDialogConfigSign } from "./Types";
import useCCTranslations from "../../utils/useCCTranslations";
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
			height: "min(calc(100vh - 192px), 300px)",
			width: "min(calc(100vw - 64px - 20px), 580px)",
		},
		imageDiv: {
			width: 300,
			height: 150,
			display: "table-cell",
			verticalAlign: "middle",
			textAlign: "center",
		},
		hiddenDiv: {
			left: -500,
			position: "absolute",
		},
	}),
	{ name: "CcSignPadDialog" }
);

const SignPadDialog = (props: SignPadDialogProps) => {
	const { t } = useCCTranslations();
	const { penColor, setSignature, signature, ...canvasProps } = props;
	const [resetCanvas, setResetCanvas] = useState(!!signature);
	const [, popDialog] = useDialogContext();
	const canvasWrapper = useRef<HTMLDivElement | null>();
	const signCanvas = useRef<SignaturePad>(null);
	const hiddenRef = useRef<HTMLInputElement>(null);
	const [canvasSize, setCanvasSize] = useState<[number, number]>([0, 0]);
	const classes = useStyles(props);
	const clearCanvas = useCallback(() => {
		if (signCanvas.current) {
			signCanvas.current.clear();
		}
		setResetCanvas(false);
	}, []);

	const saveCanvas = useCallback(() => {
		if (signCanvas.current && !signCanvas.current.isEmpty()) {
			const newSignature = signCanvas.current
				.getTrimmedCanvas()
				.toDataURL("image/png");
			if (setSignature) setSignature(newSignature);
		} else {
			if (setSignature) setSignature(resetCanvas ? signature : "");
		}
		hiddenRef.current?.focus();
		hiddenRef.current?.blur();
		popDialog();
	}, [setSignature, popDialog, signature, resetCanvas]);

	const closeCanvas = useCallback(() => {
		hiddenRef.current?.focus();
		hiddenRef.current?.blur();
		popDialog();
	}, [popDialog]);

	const handleResize = useCallback((wrapper: HTMLDivElement) => {
		setCanvasSize([wrapper.clientWidth, wrapper.clientHeight]);
	}, []);

	const setCanvasWrapperRef = useCallback(
		(node: HTMLDivElement | null) => {
			canvasWrapper.current = node;

			if (node) {
				handleResize(node);
			}
		},
		[handleResize]
	);

	useEffect(() => {
		const resizeHandler = () =>
			canvasWrapper.current && handleResize(canvasWrapper.current);

		window.addEventListener("resize", resizeHandler);
		return () => window.removeEventListener("resize", resizeHandler);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canvasWrapper.current]);

	return (
		<Dialog open={true} maxWidth="sm" onClose={closeCanvas}>
			<MuiDialogTitle id="sign-pad-dialog" className={classes.root}>
				<Typography variant="h6">
					{t("standalone.signature-pad.dialog.title")}
				</Typography>
				{closeCanvas && (
					<IconButton
						aria-label="Close"
						className={classes.closeButton}
						onClick={closeCanvas}
						size="large"
					>
						<Close />
					</IconButton>
				)}
			</MuiDialogTitle>
			<div className={classes.signDiv} ref={setCanvasWrapperRef}>
				{!resetCanvas ? (
					<SignaturePad
						ref={signCanvas}
						penColor={penColor || "blue"}
						{...canvasProps}
						canvasProps={{
							width: canvasSize[0],
							height: canvasSize[1],
						}}
					/>
				) : (
					<div className={classes.imageDiv}>
						<img src={signature} alt="Sign" />
					</div>
				)}
				<div className={classes.hiddenDiv}>
					<input
						type="text"
						value={signature ?? ""}
						readOnly
						ref={hiddenRef}
						name={props.name}
						onBlur={props.onBlur}
					/>
				</div>
			</div>
			<DialogActions>
				<Button onClick={saveCanvas} color="primary">
					{t("standalone.signature-pad.dialog.save-changes")}
				</Button>
				<Button onClick={clearCanvas} color="secondary">
					{t("standalone.signature-pad.dialog.reset")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export const SignDialog = React.memo(SignPadDialog);
