import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormHelperText } from "@mui/material";
import BackendMultiSelectWithTags from "../../../../backend-components/Selector/BackendMultiSelectWithTags";
import { FormControlFieldsetCC, } from "../../../../standalone";
import TypeIds from "../TypeIds";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendMultiSelectWithTags extends TypeIds {
    idFilter;
    props;
    constructor(props) {
        super();
        this.props = props;
        this.idFilter = {
            ...props,
            groupSorter: undefined,
            getIdOfData: undefined,
            modelToSelectorData: props.convData,
            sort: props.dataSort,
            lru: undefined,
            endAdornment: undefined,
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
            return (_jsxs(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, onBlur: handleBlur, name: field, children: [_jsx(BackendMultiSelectWithTags, { selected: value, onChange: (value) => handleChange(field, value), disabled: visibility.readOnly, required: visibility.required, dataModel: relationModel, initialData: relationData, title: label, ...this.props }), _jsx(FormHelperText, { children: errorMsg || warningMsg })] }));
        }
        throw new Error("view-only rendering not supported");
    }
}
export default RendererBackendMultiSelectWithTags;
