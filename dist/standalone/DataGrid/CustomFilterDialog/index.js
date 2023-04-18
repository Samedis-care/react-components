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
import { Collapse } from "@mui/material";
import { useDataGridProps, useDataGridState, useDataGridStyles, } from "../DataGrid";
import Dialog from "./FilterDialog";
var DataGridCustomFilters = function () {
    var classes = useDataGridStyles();
    var filterBar = useDataGridProps().filterBar;
    var _a = useDataGridState(), state = _a[0], setState = _a[1];
    var closeCustomFilterDialog = useCallback(function () {
        setState(function (prevState) { return (__assign(__assign({}, prevState), { showFilterDialog: false })); });
    }, [setState]);
    var setCustomData = useCallback(function (newState) {
        if (typeof newState === "function") {
            setState(function (prevState) { return (__assign(__assign({}, prevState), { customData: newState(prevState.customData) })); });
        }
        else {
            setState(function (prevState) { return (__assign(__assign({}, prevState), { customData: newState })); });
        }
    }, [setState]);
    if (!filterBar) {
        return React.createElement(React.Fragment, null);
    }
    return (React.createElement(Collapse, { className: classes.contentOverlayCollapse, in: state.showFilterDialog },
        React.createElement(Dialog, { closeFilterDialog: closeCustomFilterDialog, customFilters: filterBar, customData: state.customData, setCustomData: setCustomData })));
};
export default React.memo(DataGridCustomFilters);
