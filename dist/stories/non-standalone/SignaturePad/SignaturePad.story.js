import React, { useState } from "react";
import "../../../i18n";
import SignaturePad from "../../../non-standalone/SignaturePad/SignaturePad";
import { select, text, boolean, number } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { showInfoDialog } from "../../../non-standalone/Dialog";
import { useDialogContext } from "../../../framework";
export var SignaturePadStory = function () {
    var penColor = ["blue", "black", "red", "yellow", "pink"];
    var disabled = boolean("disabled", false);
    var signatureUrl = text("signature URL (base64)", "");
    var getSignature = action("getSignature");
    var _a = useState(signatureUrl || ""), signature = _a[0], setSignatureURL = _a[1];
    var setSignature = function (imageUrl) {
        getSignature(imageUrl);
        setSignatureURL(imageUrl);
    };
    var pushDialog = useDialogContext()[0];
    var previewHeight = number("Preview height", 100, {
        range: true,
        min: 16,
        max: 4096,
        step: 16,
    });
    var previewWidth = number("Preview width", 250, {
        range: true,
        min: 16,
        max: 4096,
        step: 16,
    });
    var dialogTitle = text("Dialog title", "Sample title");
    var infoText = text("Info Text", "This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here.");
    var dialogButtonLabel = text("Dialog button label", "Ok");
    var dialogButtonClick = action("onClose");
    return (React.createElement("div", { style: { height: previewHeight, width: previewWidth } },
        React.createElement(SignaturePad, { name: "story-signature", penColor: select("Pen Color", penColor, "blue"), disabled: disabled, setSignature: setSignature, signature: signature, openInfo: function () {
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
            } })));
};
SignaturePadStory.storyName = "SignaturePad";
