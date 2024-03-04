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
     * Name of the signer
     */
    signerName?: string | null;
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
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"signPadDiv" | "imageDiv" | "signPreview" | "signTextDiv" | "infoDiv">;
declare const _default: React.MemoExoticComponent<(props: SignPadProps) => React.JSX.Element>;
export default _default;
