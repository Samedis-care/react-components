import React from "react";
import { FormHelperText, Typography } from "@mui/material";
import TypeEnum from "../TypeEnum";
import ccI18n from "../../../../i18n";
import { getStringLabel, SingleSelect, } from "../../../../standalone/Selector";
import { FormControlFieldsetCC } from "../../../../standalone";
import uniqueArray from "../../../../utils/uniqueArray";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererEnumSelect extends TypeEnum {
    props;
    constructor(values, props, numericMode = false) {
        super(values, numericMode);
        this.props = props;
    }
    render(params) {
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            const data = this.values
                .filter((entry) => !entry.invisible || value === entry.value)
                .map((entry) => ({
                ...entry,
                label: entry.getLabel(),
                isDisabled: entry.invisible,
            }));
            const selected = data.find((entry) => entry.value === value) || null;
            const onLoad = (query) => uniqueArray([
                ...data.filter((entry) => getStringLabel(entry).toLowerCase().startsWith(query.toLowerCase())),
                ...data.filter((entry) => getStringLabel(entry).toLowerCase().includes(query.toLowerCase())),
            ]);
            return (React.createElement(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, onBlur: handleBlur, name: field },
                React.createElement(SingleSelect, { ...this.props, label: label, selected: selected, onLoad: onLoad, onSelect: (value) => handleChange(field, value ? value.value : ""), disabled: visibility.readOnly }),
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
