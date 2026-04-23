import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormHelperText, InputLabel, MenuItem, Select, Typography, } from "@mui/material";
import TypeEnum from "../../TypeEnum";
import ccI18n from "../../../../../i18n";
import { FormControlFieldsetCC } from "../../../../../standalone";
/**
 * Renders TypeEnum as drop-down selector (without search)
 */
class RendererEnumSelect extends TypeEnum {
    render(params) {
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            return (_jsxs(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, children: [_jsx(InputLabel, { shrink: true, children: label }), _jsx(Select, { name: field, value: value, disabled: visibility.readOnly, onChange: (evt) => handleChange(field, evt.target.value), onBlur: handleBlur, children: this.values.map((entry) => (_jsx(MenuItem, { value: entry.value, children: entry.getLabel() }, entry.value))) }), _jsx(FormHelperText, { children: errorMsg || warningMsg })] }));
        }
        const valueInfo = this.values.find((entry) => entry.value === value);
        return (_jsxs(Typography, { children: [!visibility.grid && `${label}: `, valueInfo
                    ? valueInfo.getLabel()
                    : ccI18n.t("backend-integration.model.types.renderers.enum.unknown")] }));
    }
}
export default RendererEnumSelect;
