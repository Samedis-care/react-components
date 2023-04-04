import React, { useEffect } from "react";
import { button, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { useDialogContext } from "../../../framework";
import { ConfirmDialog, showConfirmDialog } from "../../../non-standalone";
var DialogContent = function () {
    var pushDialog = useDialogContext()[0];
    var title = text("Title", "Storybook");
    var message = text("Message", "Enter your own text in Knobs!");
    var onClose = action("onClose");
    var yesLabel = text("Yes Button Label", "Yes");
    var yesAction = action("Yes Button onClick");
    var noLabel = text("No Button Label", "No");
    var noAction = action("No Button onClick");
    var openDialog = function () {
        pushDialog(React.createElement(ConfirmDialog, { title: title, message: message, onClose: onClose, textButtonYes: yesLabel, handlerButtonYes: yesAction, textButtonNo: noLabel, handlerButtonNo: noAction }));
    };
    var openDialogAsync = function () {
        showConfirmDialog(pushDialog, {
            title: title,
            message: message,
            textButtonYes: yesLabel,
            textButtonNo: noLabel,
        })
            .then(action("openDialogAsync resolved"))
            .catch(action("openDialogAsync rejected"));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(openDialog, []);
    button("Open Dialog (sync)", openDialog);
    button("Open Dialog (async)", openDialogAsync);
    return React.createElement(React.Fragment, null);
};
export var ConfirmDialogStory = function () {
    return React.createElement(DialogContent, null);
};
ConfirmDialogStory.storyName = "Confirm";
