import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import SignPad from "../../standalone/SignPad/index";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { SignDialog } from "../Dialog/SignPadDialog";
const SignaturePadCanvas = (props) => {
    const { signature, disabled, openInfo, 
    // the field's id, label, description and states go to the tile's button
    id, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, required, ...dialogProps } = props;
    const [pushDialog] = useDialogContext();
    const showSignDialog = useCallback(() => {
        if (disabled)
            return;
        pushDialog(_jsx(SignDialog, { signature: signature, ...dialogProps }));
    }, [pushDialog, disabled, signature, dialogProps]);
    return (_jsx(SignPad, { openSignPad: showSignDialog, signature: signature, signerName: dialogProps.signerName, disabled: disabled, openInfo: openInfo, id: id, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, required: required }));
};
export default React.memo(SignaturePadCanvas);
