import React from "react";
import { Typography } from "@mui/material";
import { FormHelperTextCC, TextFieldWithHelp } from "../../../../../standalone";
import TypeLocalizedString from "../../TypeLocalizedString";
export const ModelDataTypeStringLocalizedSingleRendererContext = React.createContext(null);
/**
 * Renders a text field
 */
class RendererStringLocalizedSingle extends TypeLocalizedString {
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
            return (React.createElement("input", { type: "hidden", name: field, value: JSON.stringify(value ?? {}), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(ModelDataTypeStringLocalizedSingleRendererContext.Consumer, null, (language) => {
                if (!language)
                    throw new Error("Please wrap field" +
                        field +
                        " with ModelDataTypeStringLocalizedSingleRendererContext.Provider and specify a language");
                return (React.createElement(React.Fragment, null,
                    React.createElement(TextFieldWithHelp, { variant: this.multiline ? "outlined" : undefined, fullWidth: true, ...this.props, name: field, value: value[language] ?? "", label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (evt) => {
                            handleChange(evt.target.name, {
                                ...value,
                                [language]: evt.target.value,
                            });
                        }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg }),
                    React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
            }));
        }
        return (React.createElement(ModelDataTypeStringLocalizedSingleRendererContext.Consumer, null, (language) => {
            if (!language)
                throw new Error("Please wrap field" +
                    field +
                    " with ModelDataTypeStringLocalizedSingleRendererContext.Provider and specify a language");
            return (React.createElement(Typography, { noWrap: visibility.grid },
                !visibility.grid && `${label}: `,
                value[language] ?? ""));
        }));
    }
}
export default RendererStringLocalizedSingle;
