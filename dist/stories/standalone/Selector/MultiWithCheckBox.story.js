import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import { MultiSelectWithCheckBox, } from "../../../standalone/Selector";
var values = ["value1", "value2"];
var options = [
    { label: "Value 1", value: "value1" },
    { label: "Value 2", value: "value2" },
    { label: "Value 3", value: "value3" },
];
export var MultiSelectWithCheckBoxStory = function () {
    var _a = useState(values), selected = _a[0], setSelected = _a[1];
    var onChange = function (event) {
        var values = event.target.value;
        setSelected(values);
    };
    var getSelected = function (values) {
        return values
            .map(function (selected) { var _a; return (_a = options.find(function (option) { return option.value === selected; })) === null || _a === void 0 ? void 0 : _a.label; })
            .filter(function (selected) { return selected; })
            .join(", ");
    };
    return (React.createElement(MultiSelectWithCheckBox, { values: selected, label: text("Label", "Example label"), placeholder: text("Placeholder", "Select.."), fullWidth: boolean("100% Width", true), options: options, onChange: onChange, renderValue: function (selected) { return getSelected(selected); } }));
};
MultiSelectWithCheckBoxStory.storyName = "MultiSelectWithCheckBox";
