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
    /**
     * The id of the tile's button, for a label or link of your own that points
     * to it. Default: an id generated per tile. The info button gets the id
     * `<id>-info`, and the hidden "Required" text of `required` `<id>-required`.
     */
    id?: string;
    /**
     * Ids of the elements that label the field (space separated), such as its
     * visible label. The tile's button is named by them, followed by its own
     * name, so it still tells whether the field is signed: e.g.
     * "Trainer signature Signature (Alice Müller)". The info button is named
     * "More information" followed by them. Default: none, the button's name
     * is its own (the prompt, or "Signature", with the signer).
     */
    "aria-labelledby"?: string;
    /**
     * Ids of the elements that describe the field (space separated), such as
     * its help text or error message; they become the description of the
     * tile's button. Default: none.
     */
    "aria-describedby"?: string;
    /**
     * Marks the tile's button invalid, e.g. while the field shows an error.
     * Default: not set.
     */
    "aria-invalid"?: React.AriaAttributes["aria-invalid"];
    /**
     * The field must be signed. The tile does not show it (put an asterisk on
     * your label, as a MUI FormLabel in a required FormControl does); its
     * button is described as "Required" (`standalone.signature-pad.required`),
     * before the `aria-describedby` text. A button cannot carry
     * `aria-required`, which is why this is a prop of its own. Default `false`.
     */
    required?: boolean;
}
export type SignPadClassKey = "root" | "button" | "signTextDiv" | "imageDiv" | "signPreview" | "infoDiv";
declare const _default: React.MemoExoticComponent<(inProps: SignPadProps) => React.JSX.Element>;
export default _default;
