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
}
export type SignPadDialogClassKey = "root" | "dialogTitle" | "closeButton" | "signDiv" | "imageDiv" | "hiddenDiv";
export declare const SignDialog: React.MemoExoticComponent<(inProps: SignPadDialogProps) => React.JSX.Element>;
