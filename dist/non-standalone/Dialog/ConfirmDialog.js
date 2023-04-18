import React from "react";
import { InfoDialog } from "./InfoDialog";
var ConfirmDialogRaw = function (props) { return (React.createElement(InfoDialog, { title: props.title, message: props.message, onClose: props.onClose, buttons: [
        {
            text: props.textButtonYes,
            onClick: props.handlerButtonYes,
            autoFocus: true,
        },
        {
            text: props.textButtonNo,
            onClick: props.handlerButtonNo,
            autoFocus: false,
            color: "secondary",
        },
    ] })); };
export var ConfirmDialog = React.memo(ConfirmDialogRaw);
