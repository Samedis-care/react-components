import React from "react";
import { IDialogConfigSign } from "./Types";
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
    canvasProps?: Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, "width" | "height">;
}
export type SignPadDialogClassKey = "root" | "dialogTitle" | "closeButton" | "instructions" | "signDiv" | "imageDiv" | "signatureImage" | "hiddenDiv";
export declare const SignDialog: React.MemoExoticComponent<(inProps: SignPadDialogProps) => React.JSX.Element>;
