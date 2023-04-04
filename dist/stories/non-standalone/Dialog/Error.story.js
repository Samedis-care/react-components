import React, { useEffect } from "react";
import { button, number, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { useDialogContext } from "../../../framework";
import { ErrorDialog } from "../../../non-standalone";
var DialogContent = function () {
    var pushDialog = useDialogContext()[0];
    var title = text("Title", "Storybook");
    var message = text("Message", "Enter your own text in Knobs!");
    var onClose = action("onClose");
    var buttons = [];
    var buttonCount = number("Button Count", 1, {
        range: true,
        min: 1,
        max: 5,
        step: 1,
    });
    for (var i = 0; i < buttonCount; ++i) {
        buttons.push({
            text: text("Button ".concat(i, " text"), "Btn".concat(i)),
            onClick: action("Button ".concat(i, " onClick")),
            autoFocus: i === 0,
        });
    }
    var openDialog = function () {
        pushDialog(React.createElement(ErrorDialog, { title: title, message: message, onClose: onClose, buttons: buttons }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(openDialog, []);
    button("Open Dialog", openDialog);
    return React.createElement(React.Fragment, null);
};
export var ErrorDialogStory = function () {
    return React.createElement(DialogContent, null);
};
ErrorDialogStory.storyName = "Error";
