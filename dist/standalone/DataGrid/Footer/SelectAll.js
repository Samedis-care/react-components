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
import React, { useCallback } from "react";
import { useDataGridProps, useDataGridState } from "../DataGrid";
import SelectAllView from "./SelectAllView";
var SelectAll = function () {
    var _a = useDataGridProps(), enableDeleteAll = _a.enableDeleteAll, prohibitMultiSelect = _a.prohibitMultiSelect;
    var _b = useDataGridState(), state = _b[0], setState = _b[1];
    var onSelect = useCallback(function (_evt, newChecked) {
        setState(function (prevState) { return (__assign(__assign({}, prevState), { selectAll: newChecked, selectionUpdatedByProps: false })); });
    }, [setState]);
    return (React.createElement(SelectAllView, { disabled: !enableDeleteAll || !!prohibitMultiSelect, checked: state.selectAll, onSelect: onSelect }));
};
export default React.memo(SelectAll);
