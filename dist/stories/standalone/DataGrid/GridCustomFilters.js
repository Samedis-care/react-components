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
import { Grid } from "@material-ui/core";
import { GridSingleSelectFilter } from "../../../standalone";
var options = ["Option 1", "Option 2", "Option 3"];
var GridCustomFilters = function (props) {
    var customData = props.customData, setCustomData = props.setCustomData, inDialog = props.inDialog;
    return (React.createElement(Grid, { container: true }, [1, 2, 3].map(function (filterId) { return (React.createElement(GridSingleSelectFilter, { key: filterId.toString(), label: "Filter ".concat(filterId), options: options.map(function (option) { return ({ value: option, label: option }); }), selected: customData["filter".concat(filterId)], defaultSelection: "", onSelect: function (selected) {
            setCustomData(function (old) {
                var _a;
                return (__assign(__assign({}, old), (_a = {}, _a["filter".concat(filterId)] = selected, _a)));
            });
        }, dialog: inDialog, autocompleteId: "filter".concat(filterId) })); })));
};
export default React.memo(GridCustomFilters);
