import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: JSON.stringify(value ?? {}), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (_jsx(ModelDataTypeStringLocalizedSingleRendererContext.Consumer, { children: (language) => {
                    if (!language)
                        throw new Error("Please wrap field" +
                            field +
                            " with ModelDataTypeStringLocalizedSingleRendererContext.Provider and specify a language");
                    return (_jsxs(_Fragment, { children: [_jsx(TextFieldWithHelp, { variant: this.multiline ? "outlined" : undefined, fullWidth: true, ...this.props, name: field, value: value[language] ?? "", label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (evt) => {
                                    const newValue = {
                                        ...value,
                                        [language]: evt.target.value,
                                    };
                                    if (!evt.target.value)
                                        delete newValue[language];
                                    handleChange(evt.target.name, newValue);
                                }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg }), _jsx(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg, children: errorMsg || warningMsg })] }));
                } }));
        }
        return (_jsx(ModelDataTypeStringLocalizedSingleRendererContext.Consumer, { children: (language) => {
                if (!language)
                    throw new Error("Please wrap field" +
                        field +
                        " with ModelDataTypeStringLocalizedSingleRendererContext.Provider and specify a language");
                return (_jsxs(Typography, { noWrap: visibility.grid, children: [!visibility.grid && `${label}: `, value[language] ?? ""] }));
            } }));
    }
}
export default RendererStringLocalizedSingle;
