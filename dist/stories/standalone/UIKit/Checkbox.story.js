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
import React from "react";
import { action } from "@storybook/addon-actions";
import { boolean, text } from "@storybook/addon-knobs";
import { FormGroup } from "@material-ui/core";
import Checkbox from "../../../standalone/UIKit/Checkbox";
import { Notifications as NotificationsIcon, NotificationsOff as NotificationsOffIcon, } from "@material-ui/icons";
import ComponentWithLabel from "../../../standalone/UIKit/ComponentWithLabel";
export var CheckboxStory = function () {
    var _a = React.useState({
        checkedA: true,
        checkedB: false,
        checkedC: false,
        checkedD: true,
        checkedX: true,
    }), state = _a[0], setState = _a[1];
    var handleChange = function (event) {
        var _a;
        setState(__assign(__assign({}, state), (_a = {}, _a[event.target.name] = event.target.checked, _a)));
        action("onChange");
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(FormGroup, { row: true },
            React.createElement(ComponentWithLabel, { labelPlacement: "bottom", control: React.createElement(Checkbox, { size: "medium", icon: React.createElement(NotificationsOffIcon, null), checkedIcon: React.createElement(NotificationsIcon, null), checked: state.checkedX, disabled: boolean("Disabled", false), onChange: handleChange, name: "checkedX" }), labelText: "Checkbox X\nsize medium\nAlternative Icons" })),
        React.createElement(FormGroup, { row: true },
            React.createElement(ComponentWithLabel, { control: React.createElement(Checkbox, { size: "small", checked: state.checkedA, disabled: boolean("Disabled", false), onChange: handleChange, name: "checkedA" }), labelText: text("Checkbox A Label", "Checkbox A (size small)") }),
            React.createElement(ComponentWithLabel, { labelPlacement: "start", control: React.createElement(Checkbox, { size: "medium", checked: state.checkedB, disabled: boolean("Disabled", false), onChange: handleChange, name: "checkedB" }), labelText: "Checkbox B\nsize medium\nRight (start) aligned label" })),
        React.createElement(FormGroup, { row: true },
            React.createElement(ComponentWithLabel, { labelPlacement: "top", control: React.createElement(Checkbox, { size: "small", checked: state.checkedC, disabled: boolean("Disabled", false), onChange: handleChange, name: "checkedC" }), labelText: text("Checkbox C Label", "Checkbox C (size small) (top label)") }),
            React.createElement(ComponentWithLabel, { labelPlacement: "bottom", control: React.createElement(Checkbox, { size: "medium", checked: state.checkedD, disabled: boolean("Disabled", false), onChange: handleChange, name: "checkedD" }), labelText: "Checkbox D\nsize medium\nBottom Label" }))));
};
CheckboxStory.storyName = "Checkbox";
