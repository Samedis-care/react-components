import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import DecimalInputField from "../../../../standalone/UIKit/InputControls/DecimalInputField";
import { action } from "@storybook/addon-actions";
import { useDialogContext } from "../../../../framework";
import { showInfoDialog } from "../../../../non-standalone/Dialog";
export var DecimalInputFieldStory = function () {
    var _a = useState(null), value = _a[0], setValue = _a[1];
    var pushDialog = useDialogContext()[0];
    var dialogTitle = text("Dialog title", "Sample title");
    var infoText = text("Info Text", "This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here.");
    var dialogButtonLabel = text("Dialog button label", "Ok");
    var dialogButtonClick = action("onClose");
    return (React.createElement(DecimalInputField, { label: text("Label", "Number Decimal Input"), placeholder: text("Placeholder", "Enter decimal number"), fullWidth: boolean("Full Width", true), disabled: boolean("Disable", false), value: value, onChange: function (evt, value) {
            action("onChange")(evt, value);
            setValue(value);
        }, autoFocus: true, openInfo: function () {
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
DecimalInputFieldStory.storyName = "DecimalInputField";
