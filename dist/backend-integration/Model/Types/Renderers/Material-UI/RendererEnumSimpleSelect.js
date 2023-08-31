import React from "react";
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
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            return (React.createElement(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg },
                React.createElement(InputLabel, { shrink: true }, label),
                React.createElement(Select, { name: field, value: value, disabled: visibility.readOnly, onChange: (evt) => handleChange(field, evt.target.value), onBlur: handleBlur }, this.values.map((entry) => (React.createElement(MenuItem, { key: entry.value, value: entry.value }, entry.getLabel())))),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        const valueInfo = this.values.find((entry) => entry.value === value);
        return (React.createElement(Typography, null,
            !visibility.grid && `${label}: `,
            valueInfo
                ? valueInfo.getLabel()
                : ccI18n.t("backend-integration.model.types.renderers.enum.unknown")));
    }
}
export default RendererEnumSelect;
