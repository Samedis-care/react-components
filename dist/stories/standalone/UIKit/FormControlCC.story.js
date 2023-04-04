import React from "react";
import { FormControl, FormHelperText, FormLabel, Grid, TextField, } from "@material-ui/core";
import { useMuiWarningStyles } from "../../../standalone/UIKit/MuiWarning";
var variants = ["none", "warning", "error", "both"];
var isError = function (v) { return v === "error" || v === "both"; };
var isWarn = function (v) { return v === "warning" || v === "both"; };
export var FormControlCCStory = function () {
    var classes = useMuiWarningStyles();
    var classNameWarn = function (v) {
        return isWarn(v) ? classes.warning : undefined;
    };
    return (React.createElement(Grid, { container: true, spacing: 2 }, variants.map(function (variant) { return (React.createElement(Grid, { item: true, xs: 12, key: variant, container: true, spacing: 2 },
        React.createElement(Grid, { item: true, xs: 3 },
            React.createElement(FormControl, { className: classNameWarn(variant), error: isError(variant) },
                React.createElement(FormLabel, null, "Input Label"),
                React.createElement(FormHelperText, null, variant)),
            React.createElement("br", null),
            React.createElement(FormLabel, { className: classNameWarn(variant), error: isError(variant) }, "Label Standalone"),
            React.createElement("br", null),
            React.createElement(FormHelperText, { className: classNameWarn(variant), error: isError(variant) }, "Helper Text Standalone")),
        ["standard", "filled", "outlined"].map(function (x) { return (React.createElement(Grid, { item: true, xs: 3, key: x },
            React.createElement(TextField, { label: "Input", placeholder: "placeholder", defaultValue: "data", className: classNameWarn(variant), error: isError(variant), variant: x }))); }))); })));
};
FormControlCCStory.storyName = "FormControlCC";
