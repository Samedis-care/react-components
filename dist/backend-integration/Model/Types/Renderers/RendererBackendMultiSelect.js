import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormHelperText } from "@mui/material";
import { FormControlFieldsetCC, } from "../../../../standalone";
import { FormBackendMultiSelect, } from "../../../../backend-components/Selector/FormSelectors";
import TypeIds from "../TypeIds";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendMultiSelect extends TypeIds {
    idFilter;
    props;
    constructor(props) {
        super();
        this.props = props;
        this.idFilter = {
            ...props,
            lru: undefined,
            onAddNew: undefined,
            classes: undefined,
            endAdornment: undefined,
            modelFetch: props.modelFetch,
        };
    }
    render(params) {
        const { visibility, field, label, handleChange, handleBlur, errorMsg, warningMsg, relationData, relationModel, value, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: this.stringify(value), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            if (!relationModel)
                throw new Error("Type BackendMultiSelect requires relation model: " + field);
            return (_jsxs(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, onBlur: handleBlur, name: field, children: [_jsx(FormBackendMultiSelect, { selected: value, label: label, onSelect: (value) => handleChange(field, value), disabled: visibility.readOnly, required: visibility.required, model: relationModel, initialData: relationData, ...this.props }), _jsx(FormHelperText, { children: errorMsg || warningMsg })] }));
        }
        throw new Error("view-only rendering not supported");
    }
}
export default RendererBackendMultiSelect;
