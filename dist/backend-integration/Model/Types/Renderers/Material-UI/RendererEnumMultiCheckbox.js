import React from "react";
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
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg },
                React.createElement(FormLabel, { component: "legend" }, label),
                React.createElement(FormGroup, { onBlur: handleBlur, row: this.horizontal, "data-name": field }, this.values
                    .filter((entry) => !entry.invisible)
                    .map((entry) => this.wrapButton(React.createElement(FormControlLabel, { key: entry.value, value: entry.value, control: React.createElement(Checkbox, { checked: value.includes(entry.value), name: entry.value, onChange: (evt) => handleChange(field, evt.target.checked
                            ? value.concat([entry.value]) // add value
                            : value.filter((v) => v !== entry.value) // remove value
                        ) }), label: entry.getLabel(), disabled: visibility.readOnly }), entry))),
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
export default RendererEnumRadio;
