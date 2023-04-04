import React, { useEffect } from "react";
import { ErrorDialog } from "../../../non-standalone/Dialog";
import { useDialogContext } from "../../../framework";
var ErrorComponent = function (props) {
    var propError = props.error;
    var pushDialog = useDialogContext()[0];
    useEffect(function () {
        pushDialog(React.createElement(ErrorDialog, { title: "An error occurred", message: propError.message, buttons: [
                {
                    text: "Okay",
                    autoFocus: true,
                },
            ] }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propError]);
    return React.createElement(React.Fragment, null);
};
export default React.memo(ErrorComponent);
