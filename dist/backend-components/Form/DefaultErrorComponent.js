import React, { useEffect } from "react";
import { showErrorDialog } from "../../non-standalone";
import { useDialogContext } from "../../framework";
const DefaultErrorComponent = (props) => {
    const propError = props.error;
    const [pushDialog] = useDialogContext();
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error(propError);
        void showErrorDialog(pushDialog, propError);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propError]);
    return React.createElement(React.Fragment, null);
};
export default React.memo(DefaultErrorComponent);
