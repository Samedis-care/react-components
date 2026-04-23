import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormControlLabel, FormHelperText, FormLabel, Typography, Checkbox, FormGroup, } from "@mui/material";
import TypeEnumMulti from "../../TypeEnumMulti";
import ccI18n from "../../../../../i18n";
import { FormControlFieldsetCC } from "../../../../../standalone";
/**
 * Renders TypeEnumMulti as checkboxes
 */
class RendererEnumRadio extends TypeEnumMulti {
    horizontal;
    wrapButton;
    constructor(values, horizontal = false, wrapButton = (btn) => btn) {
        super(values);
        this.horizontal = horizontal;
        this.wrapButton = wrapButton;
    }
    render(params) {
        const { visibility, field, label, handleChange, handleBlur, errorMsg, warningMsg, value, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (_jsxs(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, children: [_jsx(FormLabel, { component: "legend", children: label }), _jsx(FormGroup, { onBlur: handleBlur, row: this.horizontal, "data-name": field, children: this.values
                            .filter((entry) => !entry.invisible)
                            .map((entry) => this.wrapButton(_jsx(FormControlLabel, { value: entry.value, control: _jsx(Checkbox, { checked: value.includes(entry.value), name: entry.value, onChange: (evt) => handleChange(field, evt.target.checked
                                    ? value.concat([entry.value]) // add value
                                    : value.filter((v) => v !== entry.value)) }), label: entry.getLabel(), disabled: visibility.readOnly }, entry.value), entry)) }), _jsx(FormHelperText, { children: errorMsg || warningMsg })] }));
        }
        return (_jsxs(Typography, { children: [!visibility.grid && `${label}: `, value
                    .map((enumValue) => {
                    const valueInfo = this.values.find((entry) => entry.value === enumValue);
                    return valueInfo
                        ? valueInfo.getLabel()
                        : ccI18n.t("backend-integration.model.types.renderers.enum.unknown");
                })
                    .join(", ")] }));
    }
}
export default RendererEnumRadio;
