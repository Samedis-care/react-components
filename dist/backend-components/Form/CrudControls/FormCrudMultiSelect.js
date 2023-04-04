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
import CrudMultiSelect from "../../Selector/CrudMultiSelect";
import useLazyCrudConnector, { extractLazyCrudConnectorParams, } from "../useLazyCrudConnector";
import { useFormContextLite } from "../Form";
var FormCrudMultiSelect = function (props, ref) {
    var _a = extractLazyCrudConnectorParams(props), connectorParams = _a[0], otherProps = _a[1];
    var connector = useLazyCrudConnector(connectorParams).connector;
    var _b = useFormContextLite(), readOnly = _b.readOnly, errorComponent = _b.errorComponent;
    return (React.createElement(CrudMultiSelect, __assign({ connector: connector, errorComponent: errorComponent, disabled: props.disabled || readOnly, field: connectorParams.field, ref: ref }, otherProps)));
};
export default React.memo(React.forwardRef(FormCrudMultiSelect));
