import React from "react";
import { IDialogConfigSign } from "./Types";
export interface SignPadDialogProps extends IDialogConfigSign {
    /**
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
}
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"root" | "imageDiv" | "closeButton" | "signDiv" | "hiddenDiv">;
export declare const SignDialog: React.MemoExoticComponent<(props: SignPadDialogProps) => React.JSX.Element>;
export {};
