import React, { useEffect } from "react";
import { button, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { InputDialog, showInputDialog } from "../../../non-standalone/Dialog";
import { useDialogContext } from "../../../framework";
var DialogContent = function () {
    var pushDialog = useDialogContext()[0];
    var title = text("Title", "Storybook");
    var message = text("Message", "Enter your own text in Knobs!");
    var onClose = action("onClose");
    var yesLabel = text("Yes Button Label", "Yes");
    var yesAction = action("Yes Button onClick");
    var noLabel = text("No Button Label", "No");
    var noAction = action("No Button onClick");
    var textFieldLabel = text("Text Field Label", "Enter your input here:");
    var validate = function () { return true; };
    var openDialog = function () {
        pushDialog(React.createElement(InputDialog, { title: title, message: message, onClose: onClose, textButtonYes: yesLabel, handlerButtonYes: yesAction, textButtonNo: noLabel, handlerButtonNo: noAction, textFieldLabel: textFieldLabel, textFieldValidator: validate }));
    };
    var openDialogAsync = function () {
        showInputDialog(pushDialog, {
            title: title,
            message: message,
            textButtonYes: yesLabel,
            textButtonNo: noLabel,
            textFieldLabel: textFieldLabel,
            textFieldValidator: validate,
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
export var InputDialogStory = function () {
    return React.createElement(DialogContent, null);
};
InputDialogStory.storyName = "Input";
