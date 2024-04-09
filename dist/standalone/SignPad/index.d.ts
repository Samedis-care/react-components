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
     * custom CSS class to apply to root
     */
    className?: string;
    /**
     * Custom styles
     */
    classes?: Partial<Record<SignPadClassKey, string>>;
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
export type SignPadClassKey = "root" | "signTextDiv" | "imageDiv" | "signPreview" | "infoDiv";
declare const _default: React.MemoExoticComponent<(inProps: SignPadProps) => React.JSX.Element>;
export default _default;
