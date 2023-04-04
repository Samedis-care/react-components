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
import "../../../i18n";
import { boolean, number, text } from "@storybook/addon-knobs";
import { DataGrid, DataGridLocalStoragePersist } from "../../../standalone";
import { makeStyles } from "@material-ui/core/styles";
import { action } from "@storybook/addon-actions";
import data from "./covid-daily.json";
import GridCustomFilters from "./GridCustomFilters";
import { filterSortPaginate } from "../../../utils";
import { useTheme } from "@material-ui/core";
var useStyles = makeStyles({
    wrapper: {
        width: "90vw",
        height: "90vh",
    },
}, { name: "CcDataGridStory" });
var columnDef = [
    {
        type: "enum",
        filterData: new Array(10).fill(null).map(function (_, index) { return ({
            value: "".concat(20200819 - index),
            getLabelText: function () { return "Value ".concat(index); },
        }); }),
        field: "date",
        headerName: "Date",
    },
    { type: "number", field: "states", headerName: "States" },
    { type: "number", field: "positive", headerName: "Positive" },
    { type: "number", field: "negative", headerName: "Negative" },
    { type: "number", field: "pending", headerName: "Pending" },
    {
        type: "number",
        field: "hospitalizedCurrently",
        headerName: "HospitalizedCurrently",
    },
    {
        type: "number",
        field: "hospitalizedCumulative",
        headerName: "HospitalizedCumulative",
    },
    { type: "number", field: "inIcuCurrently", headerName: "InIcuCurrently" },
    { type: "number", field: "inIcuCumulative", headerName: "InIcuCumulative" },
    {
        type: "number",
        field: "onVentilatorCurrently",
        headerName: "OnVentilatorCurrently",
    },
    {
        type: "number",
        field: "onVentilatorCumulative",
        headerName: "OnVentilatorCumulative",
    },
    { type: "number", field: "recovered", headerName: "Recovered" },
    { type: "string", field: "dateChecked", headerName: "DateChecked" },
    { type: "number", field: "death", headerName: "Death" },
    { type: "number", field: "hospitalized", headerName: "Hospitalized" },
    { type: "string", field: "lastModified", headerName: "LastModified" },
    { type: "number", field: "total", headerName: "Total" },
    { type: "number", field: "totalTestResults", headerName: "TotalTestResults" },
    { type: "number", field: "posNeg", headerName: "PosNeg" },
    { type: "number", field: "deathIncrease", headerName: "DeathIncrease" },
    {
        type: "number",
        field: "hospitalizedIncrease",
        headerName: "HospitalizedIncrease",
    },
    { type: "number", field: "negativeIncrease", headerName: "NegativeIncrease" },
    { type: "number", field: "positiveIncrease", headerName: "PositiveIncrease" },
    {
        type: "number",
        field: "totalTestResultsIncrease",
        headerName: "TotalTestResultsIncrease",
    },
].map(function (entry) { return (__assign(__assign({}, entry), { filterable: entry.type === "number" ||
        entry.type === "string" ||
        entry.type === "enum" ||
        entry.type === "boolean", sortable: entry.type === "number" || entry.type === "string" })); });
var exporters = [
    {
        id: "excel",
        getLabel: function () { return "Excel"; },
        getWorkingLabel: function () { return "Running excel export..."; },
        getReadyLabel: function () { return "Excel spreadsheet is ready to download"; },
        getErrorLabel: function () { return "Excel export failed"; },
        onRequest: function (quickFilter, additionalFilters, fieldFilter, sort) {
            action("onRequest")(quickFilter, additionalFilters, fieldFilter, sort);
            return new Promise(function (resolve, reject) {
                window.setTimeout(function () {
                    if (Math.random() > 0.5) {
                        reject(new Error("Bad luck"));
                    }
                    else {
                        resolve(Math.random().toString());
                    }
                }, 5000);
            });
        },
        onDownload: action("onDownload"),
    },
];
export var DataGridStory = function () {
    var classes = useStyles();
    var theme = useTheme();
    return (React.createElement(DataGridLocalStoragePersist, { storageKey: "standalone-datagrid" },
        React.createElement("div", { className: classes.wrapper },
            React.createElement(DataGrid, { columns: columnDef, searchPlaceholder: text("Search placeholder", ""), onAddNew: boolean("Enable add new", true) ? action("onAddNew") : undefined, onEdit: boolean("Enable edit", true) ? action("onEdit") : undefined, onDelete: boolean("Enable delete", true) ? action("onDelete") : undefined, enableDeleteAll: boolean("Enable select all", true), filterBar: boolean("Enable custom filters?", true)
                    ? GridCustomFilters
                    : undefined, enableFilterDialogMediaQuery: theme.breakpoints.down("md"), onSelectionChange: action("onSelectionChange"), prohibitMultiSelect: boolean("Prohibit multi select", false), filterLimit: boolean("Enable filter limit", false)
                    ? number("Filter limit", 1)
                    : undefined, sortLimit: boolean("Enable sort limit", false)
                    ? number("Sort limit", 1)
                    : undefined, disableFooter: boolean("Disable Footer", false), disableSelection: boolean("Disable Selection", false), loadData: function (params) {
                    action("loadData")(params);
                    //await sleep(500);
                    var rowData = data.map(function (entry) { return (__assign({ id: entry.hash }, entry)); });
                    var processed = filterSortPaginate(rowData, params, columnDef);
                    return {
                        rowsTotal: data.length,
                        rowsFiltered: processed[1],
                        rows: processed[0],
                    };
                }, exporters: boolean("Enable export", true) ? exporters : undefined }))));
};
DataGridStory.storyName = "Basic";
