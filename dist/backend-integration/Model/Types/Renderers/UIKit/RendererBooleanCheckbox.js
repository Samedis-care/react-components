import React from "react";
import { FormControlLabel, FormHelperText, Typography } from "@mui/material";
import TypeBoolean from "../../TypeBoolean";
import ccI18n from "../../../../../i18n";
import Checkbox from "../../../../../standalone/UIKit/Checkbox";
import { FormControlFieldsetCC } from "../../../../../standalone";
/**
 * Renders a TypeBoolean field as Checkbox
 */
class RendererBooleanCheckbox extends TypeBoolean {
    invert;
    constructor(invert) {
        super();
        this.invert = invert;
    }
    render(params) {
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, checked: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            const control = (React.createElement(Checkbox, { name: field, checked: this.invert ? !value : value, disabled: visibility.readOnly, onChange: (evt, checked) => {
                    handleChange(evt.target.name, this.invert ? !checked : checked);
                }, onBlur: handleBlur, "data-name": field }));
            return visibility.grid ? (control) : (React.createElement(FormControlFieldsetCC, { required: visibility.required, error: !!errorMsg, warning: !!warningMsg, component: "fieldset", "data-name": field },
                React.createElement(FormControlLabel, { control: control, label: label }),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && `${label}: `,
            value
                ? ccI18n.t("backend-integration.model.types.renderers.boolean.true")
                : ccI18n.t("backend-integration.model.types.renderers.boolean.false")));
    }
}
export default RendererBooleanCheckbox;
