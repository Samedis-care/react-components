import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (_jsxs(_Fragment, { children: [_jsx(ColorInput, { fullWidth: true, ...this.props, name: field, value: value, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (color) => {
                            handleChange(field, color);
                        }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg }), _jsx(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg, children: errorMsg || warningMsg })] }));
        }
        return (_jsxs(Typography, { noWrap: visibility.grid, children: [!visibility.grid && `${label}: `, value] }));
    }
}
export default RendererColor;
