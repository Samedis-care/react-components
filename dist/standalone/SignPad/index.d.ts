import React from "react";
/**
 * Props of {@link SignPad}. Theme defaults go in
 * `theme.components.CcSignPad.defaultProps`.
 */
export interface SignPadProps {
    /**
     * Disables the tile: neither a click nor Enter or Space calls
     * `openSignPad`, the cursor is the default one instead of a pointer, the
     * pen icon is greyed and the button is marked `aria-disabled`, so
     * assistive technology announces it as unavailable. An unsigned tile says
     * "Not signed" (`standalone.signature-pad.not-signed`) instead of asking
     * to sign, in its text and in its button's name. The button stays
     * focusable, so a focused tile that gets disabled keeps the focus, and the
     * info button keeps working. While disabled, the root has the class
     * `CcSignPad-disabled`. Set in the theme's
     * `components.CcSignPad.defaultProps`, it disables every tile,
     * SignaturePad's included. Default `false`.
     */
    disabled?: boolean;
    /**
     * The stored signature as an image URL, normally the
     * `data:image/png;base64,...` URL that SignaturePad saves; the tile shows
     * it scaled to fit. `null` or `""` while unsigned.
     */
    signature: string | null;
    /**
     * Name of the signer, trimmed; blank means unknown. The tile does not show
     * it, but adds it to the name its button has for assistive technology,
     * e.g. "Signature (Alice Müller)". SignaturePad also shows it in the
     * dialog title. To show it on the page, put it in the field's label.
     */
    signerName?: string | null;
    /**
     * A CSS class for the tile's root, next to `classes.root`. Default: none.
     */
    className?: string;
    /**
     * CSS classes for the tile's slots: `root`, `button` (the tile's
     * button, which fills it), `signTextDiv` (the pen icon and the text of an
     * unsigned tile), `imageDiv` (the box of the preview), `signPreview` (the
     * preview `<img>`) and `infoDiv` (the box of the info button). Default:
     * none.
     */
    classes?: Partial<Record<SignPadClassKey, string>>;
    /**
     * Shows an info button ("More information") at the bottom right of the
     * tile and is called, without arguments, when it is clicked or activated
     * by keyboard; `openSignPad` is not called then. It works while
     * `disabled` too. Default: none, no info button.
     */
    openInfo?: () => void;
    /**
     * Called with the click event when the tile is clicked anywhere except on
     * the info button, and when its button is activated by keyboard (Enter or
     * Space). Not called while `disabled`. The button keeps the focus, so a
     * dialog opened from here returns focus to the tile when it closes.
     */
    openSignPad?: () => void;
    /**
     * For SignaturePad, which passes it to its dialog: called once each time
     * the user closes the dialog (Save, the close button, Escape or a backdrop
     * click), with the blur of an off-screen input that carries SignaturePad's
     * `name` and the field's value after the close (see SignDialog's `onBlur`).
     * The tile itself never calls it.
     */
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
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
     * is its own (the prompt, "Not signed" while `disabled`, or "Signature",
     * with the signer).
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
/**
 * Slot names of {@link SignPad} (theme name `CcSignPad`), see
 * {@link SignPadProps.classes}
 */
export type SignPadClassKey = "root" | "button" | "signTextDiv" | "imageDiv" | "signPreview" | "infoDiv";
/**
 * The display tile of a signature field: the stored signature scaled to
 * fit, or, while unsigned, a pen icon and a prompt to sign. It does not
 * draw: a click on the tile, or Enter or Space on its button, calls
 * `openSignPad`, unless `disabled`. For a complete field with the drawing
 * dialog use SignaturePad.
 *
 * The tile fills its parent (100% x 100%, at least 100px tall). Theme name
 * `CcSignPad`.
 */
declare const _default: React.MemoExoticComponent<(inProps: SignPadProps) => React.JSX.Element>;
export default _default;
