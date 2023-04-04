var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useEffect, useState } from "react";
import { button, number, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { TextField } from "@material-ui/core";
import { FormDialog, } from "../../../non-standalone";
import { useDialogContext } from "../../../framework";
var MyCustomDialog = function (props) {
    var _a = useState("Prefilled"), v1 = _a[0], setV1 = _a[1];
    var _b = useState(""), v2 = _b[0], setV2 = _b[1];
    var _c = useState(""), v3 = _c[0], setV3 = _c[1];
    return (React.createElement(FormDialog, __assign({}, props, { inputs: [
            React.createElement(TextField, { value: v1, key: "v1", label: "Some prefilled input", onChange: function (evt) {
                    return setV1(evt.target.value);
                }, fullWidth: true, margin: "normal" }),
            React.createElement(TextField, { value: v2, key: "v2", label: "Some empty input", onChange: function (evt) {
                    return setV2(evt.target.value);
                }, fullWidth: true, margin: "normal" }),
            React.createElement(TextField, { type: "password", key: "v3", value: v3, label: "Empty password input", onChange: function (evt) {
                    return setV3(evt.target.value);
                }, fullWidth: true, margin: "normal" }),
        ] })));
};
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
        pushDialog(React.createElement(MyCustomDialog, { title: title, message: message, onClose: onClose, buttons: buttons }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(openDialog, []);
    button("Open Dialog", openDialog);
    return React.createElement(React.Fragment, null);
};
export var FormDialogStory = function () {
    return React.createElement(DialogContent, null);
};
FormDialogStory.storyName = "Form (custom)";
