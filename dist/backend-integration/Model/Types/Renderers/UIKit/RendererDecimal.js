import React from "react";
import { Typography } from "@mui/material";
import { DecimalInputField, FormHelperTextCC, NumberFormatter, } from "../../../../../standalone";
import TypeNumber from "../../TypeNumber";
/**
 * Renders a text field
 */
class RendererDecimal extends TypeNumber {
    props;
    constructor(props) {
        super();
        this.props = props;
    }
    render(params) {
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: this.stringify(value), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement(DecimalInputField, { fullWidth: true, ...this.props, name: field, value: value, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (evt, value) => {
                        handleChange(evt.target.name, value);
                    }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg }),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && `${label}: `,
            React.createElement(NumberFormatter, { value: value })));
    }
}
export default RendererDecimal;
