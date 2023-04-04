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
import { Button, Grid } from "@material-ui/core";
import { AppsIcon } from "../../Icons";
import useCCTranslations from "../../../utils/useCCTranslations";
import { useDataGridStyles } from "../DataGrid";
import { combineClassNames } from "../../../utils";
import { useCustomFilterActiveContext } from "./FilterBar";
var CustomFiltersButton = function (props) {
    var classes = useDataGridStyles();
    var customDataChanged = useCustomFilterActiveContext()[0] > 0;
    var t = useCCTranslations().t;
    return (React.createElement(Button, __assign({}, props, { variant: "outlined" }),
        React.createElement(Grid, { container: true, spacing: 2, wrap: "nowrap", justify: "space-evenly", alignItems: "center" },
            React.createElement(Grid, { item: true }, t("standalone.data-grid.header.custom-filter-button")),
            React.createElement(Grid, { item: true },
                React.createElement(AppsIcon, { className: combineClassNames([
                        classes.customFilterIcon,
                        customDataChanged && classes.customFilterActiveIcon,
                    ]) })))));
};
export default React.memo(CustomFiltersButton);
