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
	const {
		signature,
		disabled,
		openInfo,
		// the field's id, label, description and states go to the tile's button
		id,
		"aria-labelledby": ariaLabelledBy,
		"aria-describedby": ariaDescribedBy,
		"aria-invalid": ariaInvalid,
		required,
		...dialogProps
	} = props;
	const [pushDialog] = useDialogContext();
	// the tile calls it only while enabled, so a disabled default in the theme's
	// CcSignPad props keeps the dialog closed too
	const showSignDialog = useCallback(() => {
		pushDialog(<SignDialog signature={signature} {...dialogProps} />);
	}, [pushDialog, signature, dialogProps]);
	return (
		<SignPad
			openSignPad={showSignDialog}
			signature={signature}
			signerName={dialogProps.signerName}
			disabled={disabled}
			openInfo={openInfo}
			id={id}
			aria-labelledby={ariaLabelledBy}
			aria-describedby={ariaDescribedBy}
			aria-invalid={ariaInvalid}
			required={required}
		/>
	);
};

export default React.memo(SignaturePadCanvas);
