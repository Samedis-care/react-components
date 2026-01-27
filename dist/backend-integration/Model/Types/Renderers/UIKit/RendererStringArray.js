import React from "react";
import { Typography } from "@mui/material";
import { FormHelperTextCC, GroupBox, TextFieldWithHelp, } from "../../../../../standalone";
import TypeStringArray from "../../TypeStringArray";
import { useMountLogging } from "../../../../../utils";
/**
 * Renders text fields inside a group box
 */
class RendererStringArray extends TypeStringArray {
    props;
    constructor(props) {
        super();
        this.props = props;
    }
    render(params) {
        const { visibility, field, value, label } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: this.stringify(value ?? []), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return React.createElement(RendererStringArrayComponent, { options: this.props, ...params });
        }
        return (React.createElement(Typography, { noWrap: visibility.grid },
            !visibility.grid && `${label}: `,
            (value ?? []).join("; ")));
    }
}
const RendererStringArrayComponent = (props) => {
    const { options, visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, } = props;
    useMountLogging(RendererStringArrayComponent);
    const textField = (idx) => (React.createElement(TextFieldWithHelp, { key: "input_" + idx, fullWidth: true, ...options, name: `${field}`, value: value[idx] ?? "", disabled: visibility.readOnly, required: visibility.required, onChange: (evt) => {
            const newValue = [...value];
            newValue[idx] = evt.target.value;
            handleChange(field, newValue);
        }, onBlur: (evt) => {
            handleChange(field, value.filter(Boolean));
            handleBlur(evt);
        }, error: !!errorMsg, warning: !!warningMsg }));
    return (React.createElement(GroupBox, { label: label },
        value.map((_, idx) => textField(idx)).concat(textField(value.length)),
        React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
};
export default RendererStringArray;
