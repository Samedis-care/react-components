import React from "react";
import { Typography } from "@mui/material";
import { FormHelperTextCC, NumberFormatter } from "../../../../../standalone";
import TypeNumber from "../../TypeNumber";
import CurrencyInput from "../../../../../standalone/UIKit/InputControls/CurrencyInput";
/**
 * Renders a text field
 */
class RendererDecimalCurrency extends TypeNumber {
    props;
    settings = {};
    constructor(props) {
        super();
        this.settings.updateHooks = props.currencyUpdateFields;
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { currencyUpdateFields, ...otherProps } = this.props;
            return (React.createElement(React.Fragment, null,
                React.createElement(CurrencyInput, { fullWidth: true, ...otherProps, currency: this.getCurrency(params.values), name: field, value: value, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (evt, value) => {
                        handleChange(evt.target.name, value);
                    }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg }),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && `${label}: `,
            React.createElement(NumberFormatter, { value: value, options: {
                    style: "currency",
                    currency: this.getCurrency(params.values),
                } })));
    }
    getCurrency = (params) => {
        if (typeof this.props.currency === "function") {
            return this.props.currency(params);
        }
        return this.props.currency;
    };
}
export default RendererDecimalCurrency;
