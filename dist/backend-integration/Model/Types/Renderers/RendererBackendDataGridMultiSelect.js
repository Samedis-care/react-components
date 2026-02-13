import React from "react";
import { FormControl } from "@mui/material";
import BackendDataGridMultiSelect from "../../../../backend-components/Selector/BackendDataGridMultiSelect";
import { FormHelperTextCC } from "../../../../standalone/UIKit/MuiWarning";
import TypeIds from "../TypeIds";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendDataGridMultiSelect extends TypeIds {
    props;
    constructor(props) {
        super();
        this.props = props;
    }
    render(params) {
        const { visibility, field, handleChange, handleBlur, errorMsg, warningMsg, relationModel, value, } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: this.stringify(value), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            if (!relationModel)
                throw new Error("Type BackendDataGridMultiSelect requires relation model: " + field);
            return (React.createElement(FormControl, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, onBlur: handleBlur, name: field, style: { height: "100%" } },
                React.createElement(BackendDataGridMultiSelect, { selected: value, model: relationModel, onChange: (value) => handleChange(field, value), readOnly: visibility.readOnly, ...this.props }),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        throw new Error("view-only rendering not supported");
    }
}
export default RendererBackendDataGridMultiSelect;
