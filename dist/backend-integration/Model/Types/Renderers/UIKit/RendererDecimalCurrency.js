import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: this.stringify(value), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { currencyUpdateFields, ...otherProps } = this.props;
            return (_jsxs(_Fragment, { children: [_jsx(CurrencyInput, { fullWidth: true, ...otherProps, currency: this.getCurrency(params.values), name: field, value: value, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (evt, value) => {
                            handleChange(evt.target.name, value);
                        }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg }), _jsx(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg, children: errorMsg || warningMsg })] }));
        }
        return (_jsxs(Typography, { children: [!visibility.grid && `${label}: `, _jsx(NumberFormatter, { value: value, options: {
                        style: "currency",
                        currency: this.getCurrency(params.values),
                    } })] }));
    }
    getCurrency = (params) => {
        if (typeof this.props.currency === "function") {
            return this.props.currency(params);
        }
        return this.props.currency;
    };
}
export default RendererDecimalCurrency;
