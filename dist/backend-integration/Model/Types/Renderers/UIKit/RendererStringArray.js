import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: this.stringify(value ?? []), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return _jsx(RendererStringArrayComponent, { options: this.props, ...params });
        }
        return (_jsxs(Typography, { noWrap: visibility.grid, children: [!visibility.grid && `${label}: `, (value ?? []).join("; ")] }));
    }
}
const RendererStringArrayComponent = (props) => {
    const { options, visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, } = props;
    useMountLogging(RendererStringArrayComponent);
    const textField = (idx) => (_jsx(TextFieldWithHelp, { fullWidth: true, ...options, name: `${field}`, value: value[idx] ?? "", disabled: visibility.readOnly, required: visibility.required, onChange: (evt) => {
            const newValue = [...value];
            newValue[idx] = evt.target.value;
            handleChange(field, newValue);
        }, onBlur: (evt) => {
            handleChange(field, value.filter(Boolean));
            handleBlur(evt);
        }, error: !!errorMsg, warning: !!warningMsg }, "input_" + idx));
    return (_jsxs(GroupBox, { label: label, children: [value.map((_, idx) => textField(idx)).concat(textField(value.length)), _jsx(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg, children: errorMsg || warningMsg })] }));
};
export default RendererStringArray;
