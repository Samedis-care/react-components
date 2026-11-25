import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, useCallback, useMemo, useState } from "react";
import SignPad from "../../standalone/SignPad/index";
import DialogContextProvider from "../../framework/DialogContextProvider";
import { PushedDialogCloseContext, } from "../../framework/PushedDialogCloseContext";
import { SignDialog } from "../Dialog/SignPadDialog";
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
const SignaturePadCanvas = (props) => {
    const { signature, disabled, openInfo, 
    // the field's id, label, description and states go to the tile's button
    id, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, required, ...dialogProps } = props;
    const [open, setOpen] = useState(false);
    // a field disabled while its dialog is open (the form turned read-only)
    // closes the dialog, as MUI's Autocomplete closes its popup: nothing drawn
    // there may be saved any more
    if (open && disabled)
        setOpen(false);
    // the tile calls it only while enabled, so a disabled default in the theme's
    // CcSignPad props keeps the dialog closed too
    const showSignDialog = useCallback(() => setOpen(true), []);
    // what SignDialog closes itself with (Save, Escape, the close button)
    const dialogClose = useMemo(() => ({ close: () => setOpen(false), pushed: true }), []);
    return (_jsxs(_Fragment, { children: [_jsx(SignPad, { openSignPad: showSignDialog, signature: signature, signerName: dialogProps.signerName, disabled: disabled, openInfo: openInfo, id: id, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, required: required }), open && (_jsx(DialogContextProvider, { children: _jsx(PushedDialogCloseContext.Provider, { value: dialogClose, children: _jsx(Suspense, { children: _jsx(SignDialog, { signature: signature, ...dialogProps }) }) }) }))] }));
};
export default React.memo(SignaturePadCanvas);
