import React, { Suspense, useCallback, useMemo, useState } from "react";
import SignPad, { SignPadProps } from "../../standalone/SignPad/index";
import DialogContextProvider from "../../framework/DialogContextProvider";
import {
	PushedDialogClose,
	PushedDialogCloseContext,
} from "../../framework/PushedDialogCloseContext";
import { SignDialog } from "../Dialog/SignPadDialog";

export interface SignaturePadCanvasProps extends SignPadProps {
	/**
	 * The name of the input
	 */
	name?: string;
	/**
	 * The props used to draw HTML canvas
	 */
	canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
	/**
	 * Boolean flag to clear signature
	 */
	clearOnResize?: boolean;
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
 * DialogContextProvider is needed above it.
 */
const SignaturePadCanvas = (
	props: SignaturePadCanvasProps &
		Omit<SignPadProps, "classes" | "openSignPad">,
) => {
	const {
		signature,
		disabled,
		openInfo,
		// the field's id, label, description and states go to the tile's button
		id,
		"aria-labelledby": ariaLabelledBy,
		"aria-describedby": ariaDescribedBy,
		"aria-invalid": ariaInvalid,
		required,
		...dialogProps
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
				signerName={dialogProps.signerName}
				disabled={disabled}
				openInfo={openInfo}
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
							<SignDialog signature={signature} {...dialogProps} />
						</Suspense>
					</PushedDialogCloseContext.Provider>
				</DialogContextProvider>
			)}
		</>
	);
};

export default React.memo(SignaturePadCanvas);
