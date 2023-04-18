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
import React, { useCallback, useContext, useEffect, } from "react";
import { Box, Grid, useMediaQuery } from "@mui/material";
import { useDataGridProps, useDataGridState, useDataGridStyles, } from "../DataGrid";
import CustomFiltersButton from "./CustomFiltersButton";
export var CustomFilterActiveContext = React.createContext(undefined);
export var useCustomFilterActiveContext = function () {
    var ctx = useContext(CustomFilterActiveContext);
    if (!ctx)
        throw new Error("Context not set");
    return ctx;
};
var FilterBar = function () {
    var _a;
    var props = useDataGridProps();
    var _b = useDataGridState(), state = _b[0], setState = _b[1];
    var classes = useDataGridStyles();
    var enableDialog = useMediaQuery((_a = props.enableFilterDialogMediaQuery) !== null && _a !== void 0 ? _a : "(false)");
    var setCustomData = useCallback(function (newState) {
        if (typeof newState === "function") {
            setState(function (prevState) { return (__assign(__assign({}, prevState), { customData: newState(prevState.customData) })); });
        }
        else {
            setState(function (prevState) { return (__assign(__assign({}, prevState), { customData: newState })); });
        }
    }, [setState]);
    var openDialog = useCallback(function () {
        setState(function (prevState) { return (__assign(__assign({}, prevState), { showFilterDialog: !prevState.showFilterDialog, showSettings: prevState.showFilterDialog ? prevState.showSettings : false })); });
    }, [setState]);
    // hide dialog if user resizes window
    useEffect(function () {
        if (!enableDialog) {
            setState(function (prevState) { return (__assign(__assign({}, prevState), { showFilterDialog: false })); });
        }
    }, [enableDialog, setState]);
    var FilterBarView = props.filterBar;
    return (React.createElement(Box, { ml: 4, className: classes.filterBarBox },
        React.createElement(Grid, { container: true, alignItems: "center", justifyContent: "flex-end", spacing: 2, className: classes.filterBarGrid }, FilterBarView &&
            (enableDialog ? (React.createElement(CustomFiltersButton, { onClick: openDialog })) : (React.createElement(FilterBarView, { customData: state.customData, setCustomData: setCustomData, inDialog: false }))))));
};
export default React.memo(FilterBar);
