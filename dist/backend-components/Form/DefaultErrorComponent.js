import React, { useEffect } from "react";
import { showErrorDialog } from "../../non-standalone";
import { useDialogContext } from "../../framework";
import { isValidationError } from "./ValidationError";
const DefaultErrorComponent = (props) => {
    const propError = props.error;
    const [pushDialog] = useDialogContext();
    useEffect(() => {
        if (isValidationError(propError)) {
            // eslint-disable-next-line no-console
            console.error("ValidationError", propError.mode, propError.result);
        }
        else {
            // eslint-disable-next-line no-console
            console.error(propError);
        }
        void showErrorDialog(pushDialog, propError);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propError]);
    return React.createElement(React.Fragment, null);
};
export default React.memo(DefaultErrorComponent);
