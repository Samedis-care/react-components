import React from "react";
import { FormHelperText } from "@mui/material";
import TypeStringArray from "../TypeStringArray";
import BackendMultiSelectWithTags from "../../../../backend-components/Selector/BackendMultiSelectWithTags";
import { FormControlFieldsetCC, } from "../../../../standalone";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendMultiSelectWithTags extends TypeStringArray {
    props;
    constructor(props) {
        super();
        this.props = props;
    }
    render(params) {
        const { visibility, field, label, handleChange, handleBlur, errorMsg, warningMsg, relationData, relationModel, value, } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: this.stringify(value), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            if (!relationModel)
                throw new Error("Type BackendMultiSelect requires relation model: " + field);
            return (React.createElement(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, onBlur: handleBlur, name: field },
                React.createElement(BackendMultiSelectWithTags, { selected: value, onChange: (value) => handleChange(field, value), disabled: visibility.readOnly, required: visibility.required, dataModel: relationModel, initialData: relationData, title: label, ...this.props }),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        throw new Error("view-only rendering not supported");
    }
}
export default RendererBackendMultiSelectWithTags;
