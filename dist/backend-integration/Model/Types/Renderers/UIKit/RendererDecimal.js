import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: this.stringify(value), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (_jsxs(_Fragment, { children: [_jsx(DecimalInputField, { fullWidth: true, ...this.props, name: field, value: value, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (evt, value) => {
                            handleChange(evt.target.name, value);
                        }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg }), _jsx(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg, children: errorMsg || warningMsg })] }));
        }
        return (_jsxs(Typography, { children: [!visibility.grid && `${label}: `, _jsx(NumberFormatter, { value: value })] }));
    }
}
export default RendererDecimal;
