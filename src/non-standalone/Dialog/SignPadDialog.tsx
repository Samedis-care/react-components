import React, {
	useCallback,
	useContext,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Button,
	Dialog,
	DialogActions,
	IconButton,
	styled,
	useThemeProps,
} from "@mui/material";
import MuiDialogTitle from "@mui/material/DialogTitle";
import { Close } from "@mui/icons-material";
import SignaturePad from "react-signature-pad-wrapper";
import { useDialogContext } from "../../framework";
import { PushedDialogCloseContext } from "../../framework/PushedDialogCloseContext";
import { IDialogConfigSign } from "./Types";
import useCCTranslations from "../../utils/useCCTranslations";
import { showConfirmDialogBool } from "./Utils";
import combineClassNames from "../../utils/combineClassNames";
import trimCanvas from "trim-canvas";
import { isTouchDevice } from "../../utils";
import visuallyHidden from "../../utils/internal/visuallyHidden";

export interface SignPadDialogProps extends IDialogConfigSign {
	/**
	 * custom class name to apply to root
	 */
	className?: string;
	/**
	 * Custom styles
	 */
	classes?: Partial<Record<SignPadDialogClassKey, string>>;
	/**
	 * Props for the `<canvas>` the signature is drawn on, e.g. an `aria-label`
	 * of your own or a `className`. They are spread over the canvas's own,
	 * `role="img"` and the name "Signature area"
	 * (`standalone.signature-pad.dialog.sign-area`), so an `aria-label` here
	 * replaces that name. No `width` and `height`: the canvas fills the sign
	 * area. The canvas exists only while the dialog shows no stored signature
	 * (an unsigned field, or after Clear). Default: none.
	 */
	canvasProps?: Omit<
		React.CanvasHTMLAttributes<HTMLCanvasElement>,
		"width" | "height"
	>;
}

// react-signature-pad-wrapper spreads its canvasProps onto the <canvas> as
// React props, but types them as strings only
type WrapperCanvasProps = React.ComponentProps<
	typeof SignaturePad
>["canvasProps"];

const RootDialog = styled(Dialog, { name: "CcSignPadDialog", slot: "root" })(
	{},
);

const StyledDialogTitle = styled(MuiDialogTitle, {
	name: "CcSignPadDialog",
	slot: "dialogTitle",
})(({ theme }) => ({
	margin: 0,
	padding: theme.spacing(2),
}));

const StyledCloseButton = styled(IconButton, {
	name: "CcSignPadDialog",
	slot: "closeButton",
})(({ theme }) => ({
	position: "absolute",
	right: theme.spacing(1),
	top: theme.spacing(1),
	color: theme.palette.grey[500],
}));

// how to sign, the dialog's description: read by screen readers when the dialog
// opens. Sighted users have the title and the dotted sign area
const Instructions = styled("div", {
	name: "CcSignPadDialog",
	slot: "instructions",
})(visuallyHidden);

const SignDiv = styled("div", {
	name: "CcSignPadDialog",
	slot: "signDiv",
})({
	border: "1px dotted",
	marginLeft: 10,
	marginRight: 10,
	height: "min(calc(100vh - 192px), 300px)",
	width: "min(calc(100vw - 64px - 20px), 580px)",
	"& > canvas": {
		width: "100%",
		height: "100%",
		objectFit: "contain",
	},
});

// fills the sign area, as the canvas does; the padding keeps the scaled ink off
// the dotted border
const ImageDiv = styled("div", {
	name: "CcSignPadDialog",
	slot: "imageDiv",
})(({ theme }) => ({
	boxSizing: "border-box",
	width: "100%",
	height: "100%",
	padding: theme.spacing(1),
}));

// the stored PNG's pixel size depends on the signing device (CSS size times
// devicePixelRatio, cropped to the ink): scale it to fit and center it, as the
// tile does
const SignatureImage = styled("img", {
	name: "CcSignPadDialog",
	slot: "signatureImage",
})({
	display: "block",
	width: "100%",
	height: "100%",
	objectFit: "contain",
});

const HiddenDiv = styled("div", {
	name: "CcSignPadDialog",
	slot: "hiddenDiv",
})({
	left: -500,
	position: "absolute",
});

/**
 * Whether a canvas cropped by trim-canvas holds no ink. trim-canvas crops to
 * the non-transparent pixels and leaves a single transparent pixel when there
 * are none.
 * @param trimmed The canvas trim-canvas returned
 * @returns true when the canvas holds no ink
 */
const isBlankTrim = (trimmed: HTMLCanvasElement): boolean =>
	trimmed.width === 1 &&
	trimmed.height === 1 &&
	trimmed.getContext("2d")?.getImageData(0, 0, 1, 1).data[3] === 0;

/**
 * How long after opening (ms) a backdrop click is taken for the second click
 * of the double-click that opened the dialog: Windows' default double-click
 * time
 */
const DOUBLE_CLICK_TIME = 500;

/**
 * Whether a click continues a double- or triple-click, as the browser counts
 * them (the event's `detail`): by position and the system's double-click time,
 * whatever element the first click hit
 * @param event The click event MUI's Dialog passes to onClose
 * @returns true for the second and every later click of a multi-click
 */
const isRepeatedClick = (event: object): boolean =>
	"detail" in event && typeof event.detail === "number" && event.detail > 1;

export type SignPadDialogClassKey =
	| "root"
	| "dialogTitle"
	| "closeButton"
	| "instructions"
	| "signDiv"
	| "imageDiv"
	| "signatureImage"
	| "hiddenDiv";

const SignPadDialog = (inProps: SignPadDialogProps) => {
	const props = useThemeProps({ props: inProps, name: "CcSignPadDialog" });
	const { t } = useCCTranslations();
	const {
		penColor,
		setSignature,
		signature,
		signerName: signerNameUntrim,
		classes,
		className,
		name,
		onBlur,
		canvasProps: canvasPropsProp,
	} = props;
	const signerName = signerNameUntrim?.trim();
	const [resetCanvas, setResetCanvas] = useState(!!signature);
	const [pushDialog] = useDialogContext();
	// not useCloseThisDialog, which throws: rendered without pushDialog, there is no dialog
	// to close (SignDialog has no onClose)
	const pushedClose = useContext(PushedDialogCloseContext);
	const closeThisDialog = pushedClose?.pushed ? pushedClose.close : null;
	const signCanvas = useRef<SignaturePad>(null);
	const instructionsId = useId();
	// the canvas is drawn on with a pointer only, not operated by keyboard: an image
	// with a name, so screen readers find it, also when exploring by touch. The
	// caller's canvasProps go over these
	const canvasProps = useMemo(() => {
		const merged: React.CanvasHTMLAttributes<HTMLCanvasElement> = {
			role: "img",
			"aria-label": t("standalone.signature-pad.dialog.sign-area"),
			...canvasPropsProp,
		};
		return merged as unknown as WrapperCanvasProps;
	}, [t, canvasPropsProp]);
	const hiddenRef = useRef<HTMLInputElement>(null);
	/**
	 * Reports a close to onBlur: as the blur of the off-screen input, which
	 * carries the field's name and, set here, the field's value after the close
	 * (the dialog's props may still hold the value it opened with)
	 * @param value The value Save passed to setSignature, else the unchanged
	 * signature
	 */
	const reportClose = useCallback((value: string) => {
		const input = hiddenRef.current;
		if (!input) return;
		input.value = value;
		input.focus();
		input.blur();
	}, []);
	const clearCanvas = useCallback(async () => {
		if (
			!(await showConfirmDialogBool(pushDialog, {
				title: t("standalone.signature-pad.dialog.reset-confirm.title"),
				message: signerName
					? t("standalone.signature-pad.dialog.reset-confirm.message-name", {
							NAME: signerName,
						})
					: t("standalone.signature-pad.dialog.reset-confirm.message"),
				textButtonYes: t("standalone.signature-pad.dialog.reset-confirm.yes"),
				textButtonNo: t("standalone.signature-pad.dialog.reset-confirm.no"),
			}))
		) {
			return;
		}
		if (signCanvas.current) {
			signCanvas.current.clear();
		}
		setResetCanvas(false);
	}, [pushDialog, signerName, t]);

	const saveCanvas = useCallback(() => {
		let newSignature: string;
		if (
			signCanvas.current &&
			!signCanvas.current.isEmpty() &&
			signCanvas.current.canvas.current
		) {
			const canvas = signCanvas.current.canvas.current;
			const copy = document.createElement("canvas");
			copy.width = canvas.width;
			copy.height = canvas.height;
			copy.getContext("2d")!.drawImage(canvas, 0, 0);
			const trimmed = trimCanvas(copy);
			// isEmpty() counts strokes, not pixels: a canvas whose bitmap was
			// lost still has its strokes, and must not save a blank image
			newSignature = isBlankTrim(trimmed) ? "" : trimmed.toDataURL("image/png");
		} else {
			newSignature = resetCanvas ? (signature ?? "") : "";
		}
		if (setSignature) setSignature(newSignature);
		reportClose(newSignature);
		closeThisDialog?.();
	}, [setSignature, reportClose, closeThisDialog, signature, resetCanvas]);

	// when the dialog opened (performance.now()). A double-click on the tile
	// opens it with the first click; when the tile lies outside the centered
	// dialog box, the second click lands on the backdrop
	const openedAt = useRef(0);
	useEffect(() => {
		openedAt.current = performance.now();
	}, []);

	const closeCanvas = useCallback(
		(event: object, reason: "escapeKeyDown" | "backdropClick" | "closeBtn") => {
			if (reason === "backdropClick" && isTouchDevice()) return; // prevent accidential close by hand palm when signing with pen
			// the second click of the double-click that opened the dialog: one the
			// browser counts as such (also a slow one, on a long system
			// double-click time), or one right after opening, which the browser
			// counts as a new click when the hand moved a few pixels or the
			// system's double-click time is shorter
			if (
				reason === "backdropClick" &&
				(isRepeatedClick(event) ||
					performance.now() - openedAt.current < DOUBLE_CLICK_TIME)
			)
				return;
			reportClose(signature ?? "");
			closeThisDialog?.();
		},
		[reportClose, closeThisDialog, signature],
	);
	const closeCanvasBtn = useCallback(
		() => closeCanvas({}, "closeBtn"),
		[closeCanvas],
	);

	return (
		<RootDialog
			open={true}
			maxWidth="sm"
			onClose={closeCanvas}
			className={combineClassNames([className, classes?.root])}
			aria-describedby={instructionsId}
		>
			<StyledDialogTitle className={classes?.dialogTitle}>
				{signerName
					? t("standalone.signature-pad.dialog.title-name", {
							NAME: signerName,
						})
					: t("standalone.signature-pad.dialog.title")}
			</StyledDialogTitle>
			{/* beside the heading, not in it: the Dialog is named by the heading's
			    content, which would include the button's name. Positioned on the
			    dialog's paper, it still shows in the title row */}
			<StyledCloseButton
				aria-label={t("standalone.signature-pad.dialog.close")}
				className={classes?.closeButton}
				onClick={closeCanvasBtn}
				size="large"
			>
				<Close />
			</StyledCloseButton>
			<Instructions id={instructionsId} className={classes?.instructions}>
				{resetCanvas
					? t("standalone.signature-pad.dialog.instructions-signed")
					: t("standalone.signature-pad.dialog.instructions")}
			</Instructions>
			<SignDiv className={classes?.signDiv}>
				{!resetCanvas ? (
					<SignaturePad
						ref={signCanvas}
						canvasProps={canvasProps}
						options={{
							penColor: penColor || "blue",
						}}
						// no width or height: the wrapper reads them only on mount.
						// Without them it sizes the bitmap to the canvas's box (the
						// sign area) times devicePixelRatio, on mount and on every
						// window resize, so the ink lands under the pen.
						// Re-dimensioning the canvas clears its bitmap: draw the
						// strokes again, so the ink survives a resize
						redrawOnResize
					/>
				) : (
					<ImageDiv className={classes?.imageDiv}>
						<SignatureImage
							src={signature ?? undefined}
							alt={t("standalone.signature-pad.dialog.signature")}
						/>
					</ImageDiv>
				)}
				<HiddenDiv className={classes?.hiddenDiv}>
					{/* only the target of the blur the dialog reports when it closes
					    (reportClose), carrying the field's name and value: not a
					    control, so it is out of the tab order and hidden from
					    assistive technology, as MUI Select's native input is */}
					<input
						type="text"
						readOnly
						ref={hiddenRef}
						name={name}
						onBlur={onBlur}
						tabIndex={-1}
						aria-hidden
					/>
				</HiddenDiv>
			</SignDiv>
			<DialogActions>
				<Button onClick={saveCanvas} color="primary">
					{t("standalone.signature-pad.dialog.save-changes")}
				</Button>
				<Button onClick={clearCanvas} color="error">
					{t("standalone.signature-pad.dialog.reset")}
				</Button>
			</DialogActions>
		</RootDialog>
	);
};

export const SignDialog = React.memo(SignPadDialog);
