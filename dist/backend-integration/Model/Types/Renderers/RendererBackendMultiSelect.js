var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React from "react";
import { FormHelperText } from "@material-ui/core";
import TypeStringArray from "../TypeStringArray";
import BackendMultiSelect from "../../../../backend-components/Selector/BackendMultiSelect";
import { FormControlFieldsetCC, } from "../../../../standalone";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
var RendererBackendMultiSelect = /** @class */ (function (_super) {
    __extends(RendererBackendMultiSelect, _super);
    function RendererBackendMultiSelect(props) {
        var _this = _super.call(this) || this;
        _this.props = props;
        return _this;
    }
    RendererBackendMultiSelect.prototype.render = function (params) {
        var visibility = params.visibility, field = params.field, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg, relationData = params.relationData, relationModel = params.relationModel, value = params.value;
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
                React.createElement(BackendMultiSelect, __assign({ selected: value, label: label, onSelect: function (value) { return handleChange(field, value); }, disabled: visibility.readOnly, model: relationModel, initialData: relationData }, this.props)),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        throw new Error("view-only rendering not supported");
    };
    return RendererBackendMultiSelect;
}(TypeStringArray));
export default RendererBackendMultiSelect;
