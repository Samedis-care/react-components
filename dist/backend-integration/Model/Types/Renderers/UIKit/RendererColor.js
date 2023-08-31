import React from "react";
import { Typography } from "@mui/material";
import { ColorInput, FormHelperTextCC } from "../../../../../standalone";
import TypeColor from "../../TypeColor";
/**
 * Renders a text field
 */
class RendererColor extends TypeColor {
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
            return (React.createElement("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement(ColorInput, { fullWidth: true, ...this.props, name: field, value: value, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (color) => {
                        handleChange(field, color);
                    }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg }),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, { noWrap: visibility.grid },
            !visibility.grid && `${label}: `,
            value));
    }
}
export default RendererColor;
