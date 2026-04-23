import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup, Typography, } from "@mui/material";
import TypeEnum from "../../TypeEnum";
import ccI18n from "../../../../../i18n";
import { FormControlFieldsetCC } from "../../../../../standalone";
/**
 * Renders TypeEnum as radio buttons
 */
class RendererEnumRadio extends TypeEnum {
    horizontal;
    wrapButton;
    constructor(values, horizontal = false, wrapButton = (btn) => btn, numericMode = false) {
        super(values, numericMode);
        this.horizontal = horizontal;
        this.wrapButton = wrapButton;
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
            return (_jsxs(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, children: [_jsx(FormLabel, { component: "legend", children: label }), _jsx(RadioGroup, { name: field, value: value, onChange: (evt) => handleChange(evt.target.name, evt.target.value), onBlur: handleBlur, row: this.horizontal, children: this.values
                            .filter((value) => !value.invisible)
                            .map((entry) => this.wrapButton(_jsx(FormControlLabel, { value: entry.value, control: _jsx(Radio, {}), label: entry.getLabel(), disabled: visibility.readOnly }, entry.value), entry)) }), _jsx(FormHelperText, { children: errorMsg || warningMsg })] }));
        }
        const valueInfo = this.values.find((entry) => entry.value === value);
        return (_jsxs(Typography, { children: [!visibility.grid && `${label}: `, valueInfo
                    ? valueInfo.getLabel()
                    : ccI18n.t("backend-integration.model.types.renderers.enum.unknown")] }));
    }
}
export default RendererEnumRadio;
