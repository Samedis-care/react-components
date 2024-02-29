import React, { useCallback } from "react";
import SignPad, { SignPadProps } from "../../standalone/SignPad/index";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { SignDialog } from "../Dialog/SignPadDialog";

export interface SignaturePadCanvasProps extends SignPadProps {
	/**
	 * The name of the input
	 */
	name?: string;
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
}

const SignaturePadCanvas = (
	props: SignaturePadCanvasProps &
		Omit<SignPadProps, "classes" | "openSignPad">,
) => {
	const { signature, disabled, openInfo, ...dialogProps } = props;
	const [pushDialog] = useDialogContext();
	const showSignDialog = useCallback(() => {
		if (disabled) return;
		pushDialog(<SignDialog signature={signature} {...dialogProps} />);
	}, [pushDialog, disabled, signature, dialogProps]);
	return (
		<SignPad
			openSignPad={showSignDialog}
			signature={signature}
			disabled={disabled}
			openInfo={openInfo}
		/>
	);
};

export default React.memo(SignaturePadCanvas);
