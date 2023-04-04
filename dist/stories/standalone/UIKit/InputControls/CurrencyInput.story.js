import React, { useState } from "react";
import { boolean, text, select } from "@storybook/addon-knobs";
import CurrencyInput from "../../../../standalone/UIKit/InputControls/CurrencyInput";
import { action } from "@storybook/addon-actions";
import { useDialogContext } from "../../../../framework";
import { showInfoDialog } from "../../../../non-standalone/Dialog";
export var CurrencyInputStory = function () {
    var currencies = ["USD", "EUR", "INR"];
    var _a = useState(null), value = _a[0], setValue = _a[1];
    var pushDialog = useDialogContext()[0];
    var dialogTitle = text("Dialog title", "Sample title");
    var infoText = text("Info Text", "This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here.");
    var dialogButtonLabel = text("Dialog button label", "Ok");
    var dialogButtonClick = action("onClose");
    return (React.createElement(CurrencyInput, { label: text("Label", "Currency"), placeholder: text("Placeholder", "Enter amount"), fullWidth: boolean("Full Width", true), disabled: boolean("Disable", false), currency: select("Currency", currencies, "EUR"), value: value, onChange: function (evt, value) {
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
CurrencyInputStory.storyName = "CurrencyInput";
