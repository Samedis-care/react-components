import React, { useCallback } from "react";
import SignPad from "../../standalone/SignPad/index";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { SignDialog } from "../Dialog/SignPadDialog";
const SignaturePadCanvas = (props) => {
    const { signature, disabled, openInfo, ...dialogProps } = props;
    const [pushDialog] = useDialogContext();
    const showSignDialog = useCallback(() => {
        if (disabled)
            return;
        pushDialog(React.createElement(SignDialog, { signature: signature, ...dialogProps }));
    }, [pushDialog, disabled, signature, dialogProps]);
    return (React.createElement(SignPad, { openSignPad: showSignDialog, signature: signature, disabled: disabled, openInfo: openInfo }));
};
export default React.memo(SignaturePadCanvas);
