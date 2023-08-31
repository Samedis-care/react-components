import React from "react";
import TypeString from "../../TypeString";
import { Typography } from "@mui/material";
import { FormHelperTextCC, TextFieldWithHelp } from "../../../../../standalone";
/**
 * Renders a text field
 */
class RendererString extends TypeString {
    props;
    constructor(props) {
        super(props?.multiline);
        this.props = props;
    }
    render(params) {
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value ?? "", readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement(TextFieldWithHelp, { variant: this.multiline ? "outlined" : undefined, fullWidth: true, ...this.props, name: field, value: value ?? "", label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (evt) => {
                        handleChange(evt.target.name, evt.target.value);
                    }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg }),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, { noWrap: visibility.grid },
            !visibility.grid && `${label}: `,
            value));
    }
}
export default RendererString;
