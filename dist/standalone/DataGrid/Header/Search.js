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
import { useDataGridState } from "../DataGrid";
import SearchView from "./SearchView";
var Search = function () {
    var _a = useDataGridState(), state = _a[0], setState = _a[1];
    var handleSearchChange = useCallback(function (evt) {
        var newSearch = evt.target.value;
        setState(function (prevState) { return (__assign(__assign({}, prevState), { search: newSearch })); });
    }, [setState]);
    return (React.createElement(SearchView, { search: state.search, handleSearchChange: handleSearchChange }));
};
export default React.memo(Search);
