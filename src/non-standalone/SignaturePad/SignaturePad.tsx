import React, { useState } from "react";
import SignPad from "../../standalone/SignPad/index";
import SignPadDialog from "../Dialog/SignPadDialog";

export interface SignaturePadCanvasProps {
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
	 * Open info dialog
	 */
	openInfo?: () => void;
}

const SignaturePadCanvas = (props: SignaturePadCanvasProps) => {
	const {
		signature,
		setSignature,
		disabled,
		clearOnResize,
		canvasProps,
		penColor,
		onBlur,
		openInfo,
	} = props;

	const [dialog, setDialog] = useState(false);
	const handleSignPad = React.useCallback(() => {
		if (!disabled) setDialog(!dialog);
	}, [dialog, disabled]);

	return (
		<div onBlur={onBlur}>
			<SignPad
				openSignPad={handleSignPad}
				signature={signature}
				disabled={disabled}
				openInfo={openInfo}
			/>
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
