import React from "react";
import { FormHelperText } from "@mui/material";
import TypeId from "../TypeId";
import { BackendSingleSelect } from "../../../../backend-components";
import { FormControlFieldsetCC } from "../../../../standalone";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendSingleSelect extends TypeId {
    props;
    constructor(props) {
        super();
        this.props = props;
    }
    render(params) {
        const { visibility, field, value, values, label, handleChange, handleBlur, errorMsg, warningMsg, relationData, relationModel, } = params;
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
            const modelFetch = typeof this.props.modelFetch === "function"
                ? this.props.modelFetch(values)
                : this.props.modelFetch;
            return (React.createElement(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, onBlur: handleBlur, name: field },
                React.createElement(BackendSingleSelect, { selected: value, label: label, onSelect: (value) => handleChange(field, value), disabled: visibility.readOnly, model: relationModel, initialData: relationData, ...this.props, modelFetch: modelFetch, refreshToken: JSON.stringify(relationModel.getReactQueryKeyFetchAll()) +
                        this.props.refreshToken }),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        throw new Error("view-only rendering not supported");
    }
}
export default RendererBackendSingleSelect;
