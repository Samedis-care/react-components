import React from "react";
import { boolean, text } from "@storybook/addon-knobs";
import TextFieldWithHelp from "../../../standalone/UIKit/TextFieldWithHelp";
import { action } from "@storybook/addon-actions";
import { useDialogContext } from "../../../framework";
import { showInfoDialog } from "../../../non-standalone";
export var TextFieldWithHelpStory = function () {
    var pushDialog = useDialogContext()[0];
    var dialogTitle = text("Dialog title", "Sample title");
    var infoText = text("Info Text", "This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here.");
    var dialogButtonLabel = text("Dialog button label", "Ok");
    var dialogButtonClick = action("onClose");
    return (React.createElement(TextFieldWithHelp, { label: text("Label", "FieldName"), placeholder: text("Placeholder", "Enter something here"), fullWidth: boolean("100% Width", true), important: boolean("Important", false), openInfo: function () {
            return showInfoDialog(pushDialog, {
                title: dialogTitle,
                message: (React.createElement("div", { dangerouslySetInnerHTML: {
                        __html: infoText,
                    } })),
                buttons: [
                    {
                        text: dialogButtonLabel,
                        onClick: dialogButtonClick,
                        autoFocus: true,
                        color: "primary",
                    },
                ],
            });
        } }));
};
TextFieldWithHelpStory.storyName = "TextFieldWithHelp";
