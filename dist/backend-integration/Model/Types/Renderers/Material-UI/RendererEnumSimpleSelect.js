import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormHelperText, InputLabel, MenuItem, Select, Typography, } from "@mui/material";
import TypeEnum from "../../TypeEnum";
import ccI18n from "../../../../../i18n";
import { FormControlFieldsetCC, labelWithDirtyText, } from "../../../../../standalone";
/**
 * Renders TypeEnum as drop-down selector (without search)
 */
class RendererEnumSelect extends TypeEnum {
    render(params) {
        const { visibility, field, value, label, gridCellLabel, handleChange, handleBlur, errorMsg, warningMsg, dirty, autoFocus, id, messageId, describedBy, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            // the combobox is a div, which a label's htmlFor cannot reach: it and its list of
            // options point at the label by id, else (no form behind them, e.g. a data grid
            // cell) take its text, and in a grid cell the field and row label
            const labelId = id && `${id}-label`;
            const nameProps = labelId
                ? undefined
                : { "aria-label": gridCellLabel ?? label };
            // MUI gives a combobox without an id one made from the select's name
            // (mui-component-select-<name>), the same in every row of a data grid: with no
            // form behind it the select has no name, so its combobox has no id
            const inputName = id ? field : undefined;
            return (_jsxs(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, dirty: dirty, children: [_jsx(InputLabel, { id: labelId, shrink: true, children: labelWithDirtyText(label, dirty) }), _jsx(Select, { name: inputName, value: value, disabled: visibility.readOnly, 
                        // the options are the enum's values
                        onChange: (evt) => handleChange(field, evt.target.value), onBlur: handleBlur, autoFocus: autoFocus, labelId: labelId, inputProps: nameProps, MenuProps: nameProps && { slotProps: { list: nameProps } }, SelectDisplayProps: { id }, "aria-describedby": describedBy, children: this.values.map((entry) => (_jsx(MenuItem, { value: entry.value, disabled: entry.disabled, children: entry.getLabel() }, entry.value))) }), _jsx(FormHelperText, { id: messageId, children: errorMsg || warningMsg })] }));
        }
        const valueInfo = this.values.find((entry) => entry.value === value);
        return (_jsxs(Typography, { children: [!visibility.grid && `${label}: `, valueInfo
                    ? valueInfo.getLabel()
                    : ccI18n.t("backend-integration.model.types.renderers.enum.unknown")] }));
    }
}
export default RendererEnumSelect;
