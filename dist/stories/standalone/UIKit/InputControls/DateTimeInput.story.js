import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import DateTimeInput from "../../../../standalone/UIKit/InputControls/DateTimeInput";
import { useDialogContext } from "../../../../framework";
import { showInfoDialog } from "../../../../non-standalone/Dialog";
export var DateTimeInputStory = function () {
    var _a = useState(null), selectedDate = _a[0], setSelectedDate = _a[1];
    var onChange = action("onChange");
    var pushDialog = useDialogContext()[0];
    var dialogTitle = text("Dialog title", "Sample title");
    var infoText = text("Info Text", "This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here.");
    var dialogButtonLabel = text("Dialog button label", "Ok");
    var dialogButtonClick = action("onClose");
    var handleChange = React.useCallback(function (date) {
        onChange(date);
        setSelectedDate(date);
        return date;
    }, [onChange]);
    return (React.createElement(DateTimeInput, { label: text("Label", "DateTime Field"), disabled: boolean("Disable", false), fullWidth: boolean("100% Width", true), important: boolean("Important", false), placeholder: text("placeholder", "Please Select Date & Time"), value: selectedDate, onChange: handleChange, openInfo: function () {
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
DateTimeInputStory.storyName = "DateTimeInput";
