import React from "react";
export interface SignPadProps {
    /**
     * Boolean flag to disable edit signature
     */
    disabled?: boolean;
    /**
     * The base64 string of signature
     */
    signature: string;
    /**
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
    /**
     * Open info dialog
     */
    openInfo?: () => void;
    /**
     * Open sign pad
     */
    openSignPad?: () => void;
    /**
     * Blur event
     */
    onBlur?: React.FocusEventHandler<HTMLDivElement>;
}
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"imageDiv" | "signPadDiv" | "signPreview" | "signTextDiv" | "infoDiv">;
declare const _default: React.MemoExoticComponent<(props: SignPadProps) => JSX.Element>;
export default _default;
