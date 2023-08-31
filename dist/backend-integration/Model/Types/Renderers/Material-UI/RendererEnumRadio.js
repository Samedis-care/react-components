import React from "react";
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
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg },
                React.createElement(FormLabel, { component: "legend" }, label),
                React.createElement(RadioGroup, { name: field, value: value, onChange: (evt) => handleChange(evt.target.name, evt.target.value), onBlur: handleBlur, row: this.horizontal }, this.values
                    .filter((value) => !value.invisible)
                    .map((entry) => this.wrapButton(React.createElement(FormControlLabel, { key: entry.value, value: entry.value, control: React.createElement(Radio, null), label: entry.getLabel(), disabled: visibility.readOnly }), entry))),
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
export default RendererEnumRadio;
