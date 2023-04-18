import React from "react";
import { IDialogConfigSign } from "./Types";
export interface SignPadDialogProps extends IDialogConfigSign {
    /**
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
}
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"root" | "closeButton" | "signDiv" | "imageDiv" | "hiddenDiv">;
export declare const SignDialog: React.MemoExoticComponent<(props: SignPadDialogProps) => JSX.Element>;
export {};
