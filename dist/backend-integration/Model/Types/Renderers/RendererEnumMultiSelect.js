import React from "react";
import { FormHelperText, Typography } from "@mui/material";
import TypeEnumMulti from "../TypeEnumMulti";
import ccI18n from "../../../../i18n";
import { FormControlFieldsetCC, getStringLabel, } from "../../../../standalone";
import MultiSelect from "../../../../standalone/Selector/MultiSelect";
import uniqueArray from "../../../../utils/uniqueArray";
/**
 * Renders TypeEnumMulti as selector
 */
class RendererEnumMultiSelect extends TypeEnumMulti {
    props;
    constructor(values, props) {
        super(values);
        this.props = props;
    }
    render(params) {
        const { visibility, field, label, handleChange, handleBlur, errorMsg, warningMsg, value, } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            const data = this.values
                .filter((entry) => !entry.invisible || value.includes(entry.value))
                .map((entry) => ({
                ...entry,
                label: entry.getLabel(),
                disabled: entry.invisible,
            }));
            const selected = data.filter((entry) => value.includes(entry.value));
            const onLoad = (query) => uniqueArray([
                ...data.filter((entry) => getStringLabel(entry).toLowerCase().startsWith(query.toLowerCase())),
                ...data.filter((entry) => getStringLabel(entry).toLowerCase().includes(query.toLowerCase())),
            ]);
            return (React.createElement(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, onBlur: handleBlur, name: field },
                React.createElement(MultiSelect, { refreshToken: this.values.map((e) => e.value).join(","), label: label, selected: selected, onLoad: onLoad, onSelect: (selected) => handleChange(field, selected.map((entry) => entry.value)), disabled: visibility.readOnly, ...this.props }),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && `${label}: `,
            value
                .map((enumValue) => {
                const valueInfo = this.values.find((entry) => entry.value === enumValue);
                return valueInfo
                    ? valueInfo.getLabel()
                    : ccI18n.t("backend-integration.model.types.renderers.enum.unknown");
            })
                .join(", ")));
    }
}
export default RendererEnumMultiSelect;
