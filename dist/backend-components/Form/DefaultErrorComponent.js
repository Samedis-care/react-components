import React, { useEffect } from "react";
import { showErrorDialog } from "../../non-standalone";
import { useDialogContext } from "../../framework";
var DefaultErrorComponent = function (props) {
    var propError = props.error;
    var pushDialog = useDialogContext()[0];
    useEffect(function () {
        // eslint-disable-next-line no-console
        console.error(propError);
        void showErrorDialog(pushDialog, propError);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propError]);
    return React.createElement(React.Fragment, null);
};
export default React.memo(DefaultErrorComponent);
