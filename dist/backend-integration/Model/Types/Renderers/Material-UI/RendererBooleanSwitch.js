import React from "react";
import { FormControlLabel, FormHelperText, Switch, Typography, } from "@mui/material";
import TypeBoolean from "../../TypeBoolean";
import ccI18n from "../../../../../i18n";
import { FormControlFieldsetCC } from "../../../../../standalone/UIKit/MuiWarning";
/**
 * Renders a TypeBoolean field as Switch
 */
class RendererBooleanSwitch extends TypeBoolean {
    invert;
    props;
    constructor(invert, props) {
        super();
        this.invert = invert;
        this.props = props;
    }
    render(params) {
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, checked: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(FormControlFieldsetCC, { required: visibility.required, error: !!errorMsg, warning: !!warningMsg, component: "fieldset" },
                React.createElement(FormControlLabel, { control: React.createElement(Switch, { ...this.props?.switchProps, name: field, checked: this.invert ? !value : value, disabled: visibility.readOnly, onChange: (evt, checked) => {
                            handleChange(evt.target.name, this.invert ? !checked : checked);
                        }, onBlur: handleBlur }), label: label }),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && `${label}: `,
            value
                ? ccI18n.t("backend-integration.model.types.renderers.boolean.true")
                : ccI18n.t("backend-integration.model.types.renderers.boolean.false")));
    }
}
export default RendererBooleanSwitch;
