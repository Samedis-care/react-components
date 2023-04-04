import React, { useState } from "react";
import MultiLanguageInput from "../../../../standalone/UIKit/InputControls/MultiLanguageInput";
import GroupBox from "../../../../standalone/GroupBox";
import { Grid } from "@material-ui/core";
export var MultiLanguageInputStory = function () {
    var _a = useState({}), values = _a[0], setValues = _a[1];
    var enabledLangs = [
        "en",
        "de",
        "fr",
    ];
    return (React.createElement(Grid, { container: true, spacing: 2 },
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(GroupBox, { label: "no label, enabled" },
                React.createElement(MultiLanguageInput, { enabledLanguages: enabledLangs, values: values, onChange: setValues }))),
        React.createElement(Grid, { item: true, xs: 6 },
            React.createElement(GroupBox, { label: "label, enabled" },
                React.createElement(MultiLanguageInput, { enabledLanguages: enabledLangs, values: values, onChange: setValues, label: "Example Label" }))),
        React.createElement(Grid, { item: true, xs: 6 },
            React.createElement(GroupBox, { label: "label, disabled" },
                React.createElement(MultiLanguageInput, { enabledLanguages: enabledLangs, values: values, onChange: setValues, label: "Example Label", disabled: true }))),
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(GroupBox, { label: "no label, disabled" },
                React.createElement(MultiLanguageInput, { enabledLanguages: enabledLangs, values: values, onChange: setValues, disabled: true }))),
        React.createElement(Grid, { item: true, xs: 6 },
            React.createElement(GroupBox, { label: "label, enabled, multiline" },
                React.createElement(MultiLanguageInput, { enabledLanguages: enabledLangs, values: values, onChange: setValues, label: "Example Label", multiline: true })))));
};
MultiLanguageInputStory.storyName = "MultiLanguageInput";
