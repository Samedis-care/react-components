import React from "react";
import SignPad, { SignPadProps } from "../../standalone/SignPad/index";
import { useDialogContext } from "../../framework";
import { showSignPadDialog } from "../../non-standalone/Dialog";

export interface SignaturePadCanvasProps extends SignPadProps {
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
	 * Callback method which returns signature base64 string
	 */
	setSignature?: (imageURL: string) => void;
	/**
	 * Blur event
	 */
	onBlur?: React.FocusEventHandler<HTMLDivElement>;
}

const SignaturePadCanvas = (
	props: SignaturePadCanvasProps & Omit<SignPadProps, "classes" | "openSignPad">
) => {
	const { signature, disabled, onBlur, openInfo, ...dialogProps } = props;
	const [pushDialog] = useDialogContext();

	return (
		<div onBlur={onBlur}>
			<SignPad
				openSignPad={() =>
					showSignPadDialog(pushDialog, { disabled, signature, ...dialogProps })
				}
				signature={signature}
				disabled={disabled}
				openInfo={openInfo}
			/>
		</div>
	);
};

export default React.memo(SignaturePadCanvas);
