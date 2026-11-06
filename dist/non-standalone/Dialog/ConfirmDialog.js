import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { InfoDialog } from "./InfoDialog";
const ConfirmDialogRaw = (props) => {
    const { title, message, onClose, textButtonYes, textButtonNo, handlerButtonYes, handlerButtonNo, } = props;
    // the handlers are called without the button's close, so that a promise's resolve or
    // reject passed as a handler settles with undefined. A returned promise is still awaited.
    const buttons = useMemo(() => [
        {
            text: textButtonYes,
            onClick: () => handlerButtonYes(),
            autoFocus: true,
        },
        {
            text: textButtonNo,
            onClick: () => handlerButtonNo(),
            autoFocus: false,
            color: "secondary",
        },
    ], [textButtonYes, textButtonNo, handlerButtonYes, handlerButtonNo]);
    return (_jsx(InfoDialog, { title: title, message: message, onClose: onClose, buttons: buttons }));
};
export const ConfirmDialog = React.memo(ConfirmDialogRaw);
