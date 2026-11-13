import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Checkbox, FormControlLabel, FormHelperText, styled, Typography, } from "@mui/material";
import TypeBoolean from "../../TypeBoolean";
import ccI18n from "../../../../../i18n";
import { FormControlFieldsetCC } from "../../../../../standalone";
import focusRing from "../../../../../utils/internal/focusRing";
/**
 * MUI's Checkbox with CC's keyboard focus ring around its box, where MUI draws
 * the ring of the theme's `focusVisible`
 */
const FocusRingCheckbox = styled(Checkbox)(({ theme }) => ({
    "&.Mui-focusVisible > svg": {
        borderRadius: theme.shape.borderRadius,
        ...focusRing(theme, 2),
    },
}));
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
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, dirty, autoFocus, id, messageId, describedBy, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, checked: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            const control = (_jsx(FocusRingCheckbox, { name: field, checked: this.invert ? !value : value, disabled: visibility.readOnly, onChange: (evt, checked) => {
                    handleChange(evt.target.name, this.invert ? !checked : checked);
                }, onBlur: handleBlur, "data-name": field, autoFocus: autoFocus, id: id, slotProps: {
                    input: {
                        "aria-invalid": !!errorMsg,
                        "aria-describedby": describedBy,
                    },
                } }));
            return visibility.grid ? (control) : (_jsxs(FormControlFieldsetCC, { required: visibility.required, error: !!errorMsg, warning: !!warningMsg, dirty: dirty, component: "fieldset", children: [_jsx(FormControlLabel, { control: control, label: label }), _jsx(FormHelperText, { id: messageId, children: errorMsg || warningMsg })] }));
        }
        return (_jsxs(Typography, { children: [!visibility.grid && `${label}: `, value
                    ? ccI18n.t("backend-integration.model.types.renderers.boolean.true")
                    : ccI18n.t("backend-integration.model.types.renderers.boolean.false")] }));
    }
}
export default RendererBooleanCheckbox;
