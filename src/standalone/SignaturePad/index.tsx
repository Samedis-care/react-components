import React from "react";
import { TextFieldProps } from "@material-ui/core";
import SignatureCanvas from "react-signature-canvas";

import { UIInputProps, useInputStyles } from "../UIKit/CommonStyles";

export interface SignaturePadProps extends UIInputProps {
	infoText?: React.ReactNode;
	canvasProps: React.CanvasHTMLAttributes<HTMLCanvasElement>;
	clearOnResize?: boolean;
}

const SignaturePad = (props: SignaturePadProps & TextFieldProps) => {
	const { infoText, important, canvasProps, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	return (
		<div className="p-md-4">
			<SignatureCanvas penColor="blue" {...canvasProps} />
		</div>
	);
};

export default React.memo(SignaturePad);
