import React from "react";
import { SignPadProps } from "../../standalone/SignPad/index";
import { SignPadDialogProps } from "../Dialog/SignPadDialog";
/**
 * Props of SignaturePad. The tile (SignPad) gets `signature`, `signerName`,
 * `disabled`, `openInfo`, `className`, `classes`, `id`, the ARIA props and
 * `required`; the dialog (SignDialog) gets `signature`, `signerName`, `name`,
 * `penColor`, `setSignature`, `onBlur` and `canvasProps`. SignPad's
 * `openSignPad` is not one of them: the field opens its own dialog.
 */
export interface SignaturePadProps extends Omit<SignPadProps, "openSignPad"> {
    /**
     * The name of the input
     */
    name?: string;
    /**
     * Props for the dialog's drawing canvas, as SignDialog's `canvasProps`:
     * e.g. an `aria-label` of your own, which replaces the canvas's name
     * "Signature area". Default: none.
     */
    canvasProps?: SignPadDialogProps["canvasProps"];
    /**
     * Use to change signature pen color
     */
    penColor?: string;
    /**
     * Callback method which returns signature base64 string. Save in the open
     * dialog calls the function of the current render, not the one of the
     * click that opened it.
     */
    setSignature?: (imageURL: string) => void;
    /**
     * A CSS class for the tile's root, as SignPad's `className`. It does not
     * reach the dialog: style that with `components.CcSignPadDialog` of a theme
     * around the field.
     */
    className?: string;
    /**
     * CSS classes for the tile's slots, as SignPad's `classes`. They do not
     * reach the dialog, whose slots have their own names (CcSignPadDialog):
     * style them with `components.CcSignPadDialog` of a theme around the field.
     */
    classes?: SignPadProps["classes"];
}
declare const _default: React.MemoExoticComponent<(props: SignaturePadProps) => React.JSX.Element>;
export default _default;
