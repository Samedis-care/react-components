import React from "react";
export interface SignPadProps {
    /**
     * Shows the tile as disabled: greys the pen icon and marks its button
     * `aria-disabled`, so assistive technology announces it as unavailable.
     * The button stays focusable, so a focused tile that gets disabled keeps
     * the focus. Default `false`.
     */
    disabled?: boolean;
    /**
     * The base64 string of signature, null while unsigned
     */
    signature: string | null;
    /**
     * Name of the signer, trimmed; blank means unknown. The tile does not show
     * it, but adds it to the name its button has for assistive technology,
     * e.g. "Signature (Alice Müller)". SignaturePad also shows it in the
     * dialog title.
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
     * Called with the click event when the tile is clicked anywhere except on
     * the info button, and when its button is activated by keyboard (Enter or
     * Space). The button keeps the focus, so a dialog opened from here returns
     * focus to the tile when it closes.
     */
    openSignPad?: () => void;
    /**
     * Blur event
     */
    onBlur?: React.FocusEventHandler<HTMLDivElement>;
}
export type SignPadClassKey = "root" | "button" | "signTextDiv" | "imageDiv" | "signPreview" | "infoDiv";
declare const _default: React.MemoExoticComponent<(inProps: SignPadProps) => React.JSX.Element>;
export default _default;
