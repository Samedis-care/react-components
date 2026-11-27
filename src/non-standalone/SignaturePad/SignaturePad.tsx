import React, { Suspense, useCallback, useMemo, useState } from "react";
import SignPad, { SignPadProps } from "../../standalone/SignPad/index";
import DialogContextProvider from "../../framework/DialogContextProvider";
import {
	PushedDialogClose,
	PushedDialogCloseContext,
} from "../../framework/PushedDialogCloseContext";
import { SignDialog, SignPadDialogProps } from "../Dialog/SignPadDialog";

/**
 * Props of SignaturePad. The tile (SignPad) gets `signature`, `signerName`,
 * `disabled`, `openInfo`, `className`, `classes`, `id`, the ARIA props and
 * `required`; the dialog (SignDialog) gets `signature`, `signerName`, `name`,
 * `penColor`, `setSignature`, `onBlur` and `canvasProps`. SignPad's
 * `openSignPad` is not one of them: the field opens its own dialog.
 */
export interface SignaturePadCanvasProps extends Omit<
	SignPadProps,
	"openSignPad"
> {
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

/**
 * A signature field: a SignPad tile that opens the drawing dialog
 * (SignDialog) on click, Enter or Space. The dialog is part of the field: it
 * shows the field's current props while open (a signer name or a value that
 * arrives later, the current `setSignature`), it gets the contexts around the
 * field (e.g. a ThemeProvider with `CcSignPadDialog` defaults), and it
 * closes, unsaved, when the field unmounts or becomes `disabled`. Escape,
 * the close button and Save close it too, and focus returns to the tile. The
 * dialog and its Clear confirmation render from the field itself, so no
 * DialogContextProvider is needed above it. `className` and `classes` style
 * the tile; a theme's `components.CcSignPadDialog` styles the dialog.
 */
const SignaturePadCanvas = (props: SignaturePadCanvasProps) => {
	const {
		signature,
		signerName,
		disabled,
		openInfo,
		className,
		classes,
		// the field's id, label, description and states go to the tile's button
		id,
		"aria-labelledby": ariaLabelledBy,
		"aria-describedby": ariaDescribedBy,
		"aria-invalid": ariaInvalid,
		required,
		// the dialog's
		name,
		penColor,
		setSignature,
		onBlur,
		canvasProps,
	} = props;
	const [open, setOpen] = useState(false);
	// a field disabled while its dialog is open (the form turned read-only)
	// closes the dialog, as MUI's Autocomplete closes its popup: nothing drawn
	// there may be saved any more
	if (open && disabled) setOpen(false);
	// the tile calls it only while enabled, so a disabled default in the theme's
	// CcSignPad props keeps the dialog closed too
	const showSignDialog = useCallback(() => setOpen(true), []);
	// what SignDialog closes itself with (Save, Escape, the close button)
	const dialogClose = useMemo<PushedDialogClose>(
		() => ({ close: () => setOpen(false), pushed: true }),
		[],
	);
	return (
		<>
			<SignPad
				openSignPad={showSignDialog}
				signature={signature}
				signerName={signerName}
				disabled={disabled}
				openInfo={openInfo}
				className={className}
				classes={classes}
				id={id}
				aria-labelledby={ariaLabelledBy}
				aria-describedby={ariaDescribedBy}
				aria-invalid={ariaInvalid}
				required={required}
			/>
			{open && (
				// rendered here rather than pushed, so it follows the props and the
				// contexts of the field and unmounts with it. Its own provider holds
				// the Clear confirmation, which then closes with it too; Suspense, as
				// around a pushed dialog, keeps a suspending dialog from replacing
				// the page around the field
				<DialogContextProvider>
					<PushedDialogCloseContext.Provider value={dialogClose}>
						<Suspense>
							<SignDialog
								signature={signature}
								signerName={signerName}
								name={name}
								penColor={penColor}
								setSignature={setSignature}
								onBlur={onBlur}
								canvasProps={canvasProps}
							/>
						</Suspense>
					</PushedDialogCloseContext.Provider>
				</DialogContextProvider>
			)}
		</>
	);
};

export default React.memo(SignaturePadCanvas);
