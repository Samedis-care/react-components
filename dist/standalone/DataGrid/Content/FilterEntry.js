import React, { useCallback, useState } from "react";
import { Checkbox, Divider, FormControlLabel, Grid, IconButton, List, ListItem, ListItemText, MenuItem, Select, TextField, Tooltip, } from "@mui/material";
import { Delete as ClearIcon } from "@mui/icons-material";
import FilterCombinator from "./FilterCombinator";
import { useDataGridProps, useDataGridStyles, } from "../DataGrid";
import { LocalizedDateTimePicker, LocalizedKeyboardDatePicker, } from "../../LocalizedDateTimePickers";
import useCCTranslations from "../../../utils/useCCTranslations";
import { normalizeDate } from "../../../backend-integration/Model/Types/Utils/DateUtils";
import moment from "moment";
var ENUM_FILTER_MAGIC_EMPTY = "__MAGIC_EMPTY__";
var FilterEntry = function (props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var onChange = props.onChange, depth = props.depth, close = props.close;
    var isFirstFilter = depth === 1;
    var t = useCCTranslations().t;
    var _k = useDataGridProps(), filterLimit = _k.filterLimit, isFilterSupported = _k.isFilterSupported;
    var _l = useState(""), enumFilterSearch = _l[0], setEnumFilterSearch = _l[1];
    var classes = useDataGridStyles();
    var maxDepth = filterLimit;
    var defaultFilterType = [
        "string",
        "localized-string",
        "combined-string",
    ].includes((_a = props.valueType) !== null && _a !== void 0 ? _a : "")
        ? "contains"
        : props.valueType === "enum"
            ? "inSet"
            : "equals";
    var filterType = ((_b = props.value) === null || _b === void 0 ? void 0 : _b.type) || defaultFilterType;
    var filterValue = ((_c = props.value) === null || _c === void 0 ? void 0 : _c.value1) || "";
    var filterValue2 = ((_d = props.value) === null || _d === void 0 ? void 0 : _d.value2) || "";
    var subFilterComboType = ((_e = props.value) === null || _e === void 0 ? void 0 : _e.nextFilterType) || "and";
    var subFilter = ((_f = props.value) === null || _f === void 0 ? void 0 : _f.nextFilter) || undefined;
    var checkSupport = function (dataType, filterType) {
        if (!isFilterSupported)
            return true;
        return isFilterSupported(dataType, filterType);
    };
    var resetFilter = useCallback(function () {
        onChange({ type: defaultFilterType, value1: "", value2: "" });
        close();
    }, [close, onChange, defaultFilterType]);
    var updateParent = function () {
        return onChange({
            type: filterType,
            value1: filterValue,
            value2: filterValue2,
            nextFilterType: subFilterComboType,
            nextFilter: subFilter,
        });
    };
    var onFilterTypeChange = function (event) {
        // clear magic value
        if (filterType === "empty" || filterType === "notEmpty") {
            filterValue = "";
        }
        filterType = event.target.value;
        // set magic value to mark filter as active
        if (filterType === "empty" || filterType === "notEmpty") {
            filterValue = filterType;
        }
        filterValue2 = "";
        updateParent();
    };
    var onFilterValueChange = function (event) {
        filterValue = event.target.value;
        if (!filterValue) {
            subFilterComboType = "and";
            subFilter = undefined;
        }
        updateParent();
    };
    var onFilterValueChangeDate = function (date) {
        filterValue = "";
        if (!date) {
            subFilterComboType = "and";
            subFilter = undefined;
        }
        else if (date.isValid()) {
            filterValue = normalizeDate(date.toDate()).toISOString();
        }
        updateParent();
    };
    var onFilterValueChangeBool = function () {
        filterType = "equals";
        if (!filterValue) {
            filterValue = "true";
        }
        else if (filterValue === "true") {
            filterValue = "false";
        }
        else {
            filterValue = "";
        }
        updateParent();
    };
    var handleNullEnum = function () {
        // deal with empty/null enum values by using empty filter (possibly chained via OR)
        var split = filterValue.split(",");
        var hasEmpty = split.includes(ENUM_FILTER_MAGIC_EMPTY);
        if (split.length === 1) {
            filterType = hasEmpty ? "empty" : "inSet";
            subFilter = undefined;
        }
        else if (hasEmpty) {
            filterType = "inSet";
            subFilterComboType = "or";
            subFilter = {
                type: "empty",
                value1: "empty",
                value2: "",
                nextFilter: undefined,
                nextFilterType: undefined,
            };
        }
    };
    var onFilterValueChangeEnumAll = function (_, checked) {
        if (checked) {
            filterValue = props.valueData
                .filter(function (entry) { return !entry.isDivider; })
                .map(function (entry) { return entry.value || ENUM_FILTER_MAGIC_EMPTY; })
                .join(",");
        }
        else {
            filterValue = "";
        }
        handleNullEnum();
        updateParent();
    };
    var onFilterValueChangeEnum = function (evt, checked) {
        var currentlyChecked = filterValue.length === 0 ? [] : filterValue.split(",");
        if (!checked) {
            currentlyChecked = currentlyChecked.filter(function (val) { return val !== evt.target.value; });
        }
        else {
            currentlyChecked.push(evt.target.value);
        }
        filterValue = currentlyChecked.join(",");
        handleNullEnum();
        updateParent();
    };
    var onFilterValue2Change = function (event) {
        filterValue2 = event.target.value;
        updateParent();
    };
    var onFilterValue2ChangeDate = function (date) {
        filterValue2 = date ? normalizeDate(date.toDate()).toISOString() : "";
        updateParent();
    };
    var onSubFilterTypeChange = function (value) {
        subFilterComboType = value;
        updateParent();
    };
    var onSubFilterChange = function (value) {
        subFilter = value;
        updateParent();
    };
    var filterTypeMenuItems = [
        checkSupport(props.valueType, "equals") && (React.createElement(MenuItem, { key: "equals", value: "equals" }, t("standalone.data-grid.content.filter-type.eq"))),
        checkSupport(props.valueType, "notEqual") && (React.createElement(MenuItem, { key: "notEqual", value: "notEqual" }, t("standalone.data-grid.content.filter-type.not-eq"))),
        checkSupport(props.valueType, "empty") && (React.createElement(MenuItem, { key: "empty", value: "empty" }, t("standalone.data-grid.content.filter-type.empty"))),
        checkSupport(props.valueType, "notEmpty") && (React.createElement(MenuItem, { key: "notEmpty", value: "notEmpty" }, t("standalone.data-grid.content.filter-type.not-empty"))),
    ];
    if (["string", "localized-string", "combined-string"].includes((_g = props.valueType) !== null && _g !== void 0 ? _g : "")) {
        filterTypeMenuItems.push(checkSupport(props.valueType, "contains") && (React.createElement(MenuItem, { key: "contains", value: "contains" }, t("standalone.data-grid.content.filter-type.contains"))), checkSupport(props.valueType, "notContains") && (React.createElement(MenuItem, { key: "notContains", value: "notContains" }, t("standalone.data-grid.content.filter-type.not-contains"))), checkSupport(props.valueType, "startsWith") && (React.createElement(MenuItem, { key: "startsWith", value: "startsWith" }, t("standalone.data-grid.content.filter-type.starts-with"))), checkSupport(props.valueType, "endsWith") && (React.createElement(MenuItem, { key: "endsWith", value: "endsWith" }, t("standalone.data-grid.content.filter-type.ends-with"))));
    }
    else if (props.valueType === "number") {
        filterTypeMenuItems.push(checkSupport(props.valueType, "lessThan") && (React.createElement(MenuItem, { key: "lessThan", value: "lessThan" }, t("standalone.data-grid.content.filter-type.lt"))), checkSupport(props.valueType, "lessThanOrEqual") && (React.createElement(MenuItem, { key: "lessThanOrEqual", value: "lessThanOrEqual" }, t("standalone.data-grid.content.filter-type.lte"))), checkSupport(props.valueType, "greaterThan") && (React.createElement(MenuItem, { key: "greaterThan", value: "greaterThan" }, t("standalone.data-grid.content.filter-type.gt"))), checkSupport(props.valueType, "greaterThanOrEqual") && (React.createElement(MenuItem, { key: "greaterThanOrEqual", value: "greaterThanOrEqual" }, t("standalone.data-grid.content.filter-type.gte"))), checkSupport(props.valueType, "inRange") && (React.createElement(MenuItem, { key: "inRange", value: "inRange" }, t("standalone.data-grid.content.filter-type.in-range"))));
    }
    else if (props.valueType === "date" || props.valueType === "datetime") {
        filterTypeMenuItems.push(checkSupport(props.valueType, "lessThan") && (React.createElement(MenuItem, { key: "lessThan", value: "lessThan" }, t("standalone.data-grid.content.filter-type.lt-date"))), checkSupport(props.valueType, "lessThanOrEqual") && (React.createElement(MenuItem, { key: "lessThanOrEqual", value: "lessThanOrEqual" }, t("standalone.data-grid.content.filter-type.lte-date"))), checkSupport(props.valueType, "greaterThan") && (React.createElement(MenuItem, { key: "greaterThan", value: "greaterThan" }, t("standalone.data-grid.content.filter-type.gt-date"))), checkSupport(props.valueType, "greaterThanOrEqual") && (React.createElement(MenuItem, { key: "greaterThanOrEqual", value: "greaterThanOrEqual" }, t("standalone.data-grid.content.filter-type.gte-date"))), checkSupport(props.valueType, "inRange") && (React.createElement(MenuItem, { key: "inRange", value: "inRange" }, t("standalone.data-grid.content.filter-type.in-range-date"))));
    }
    filterTypeMenuItems = filterTypeMenuItems.filter(function (e) { return e; });
    return (React.createElement(React.Fragment, null,
        isFirstFilter && ((_h = props.value) === null || _h === void 0 ? void 0 : _h.value1) && (React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Grid, { container: true, justifyContent: "flex-end", alignItems: "center" },
                React.createElement(Grid, { item: true },
                    React.createElement(Tooltip, { title: (_j = t("standalone.data-grid.content.reset-column-filter")) !== null && _j !== void 0 ? _j : "" },
                        React.createElement("span", null,
                            React.createElement(IconButton, { className: classes.filterClearBtn, onClick: resetFilter, size: "large" },
                                React.createElement(ClearIcon, null)))))))),
        (props.valueType === "string" ||
            props.valueType === "localized-string" ||
            props.valueType === "combined-string" ||
            props.valueType === "number" ||
            props.valueType === "date" ||
            props.valueType === "datetime") && (React.createElement(React.Fragment, null,
            React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(Select, { onChange: onFilterTypeChange, value: filterType, fullWidth: true }, filterTypeMenuItems)),
            filterType !== "empty" && filterType !== "notEmpty" && (React.createElement(Grid, { item: true, xs: 12 }, props.valueType === "date" ? (React.createElement(LocalizedKeyboardDatePicker, { value: filterValue === "" ? null : moment(filterValue), onChange: onFilterValueChangeDate, fullWidth: true, autoFocus: depth === 1 })) : props.valueType === "datetime" ? (React.createElement(LocalizedDateTimePicker, { value: filterValue === "" ? null : moment(filterValue), onChange: onFilterValueChangeDate, fullWidth: true, autoFocus: depth === 1 })) : (React.createElement(TextField, { value: filterValue, onChange: onFilterValueChange, fullWidth: true, autoFocus: depth === 1 })))),
            filterType === "inRange" && (React.createElement(Grid, { item: true, xs: 12 }, props.valueType === "date" ? (React.createElement(LocalizedKeyboardDatePicker, { value: filterValue2 === "" ? null : moment(filterValue2), onChange: onFilterValue2ChangeDate })) : props.valueType === "datetime" ? (React.createElement(LocalizedDateTimePicker, { value: filterValue2 === "" ? null : moment(filterValue2), onChange: onFilterValueChangeDate })) : (React.createElement(TextField, { value: filterValue2, onChange: onFilterValue2Change, fullWidth: true })))))),
        props.valueType === "boolean" && (React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(FormControlLabel, { control: React.createElement(Checkbox, { checked: filterValue === "true", onClick: onFilterValueChangeBool, indeterminate: !filterValue, autoFocus: depth === 1 }), label: (function () {
                    var _a, _b;
                    if (!filterValue)
                        return t("standalone.data-grid.content.bool-filter.any");
                    var entry = (_a = props.valueData) === null || _a === void 0 ? void 0 : _a.find(function (entry) { return entry.value === filterValue; });
                    if (!entry)
                        return t("standalone.data-grid.content.bool-filter." + filterValue);
                    return ((_b = entry.getLabel) !== null && _b !== void 0 ? _b : entry.getLabelText)();
                })() }))),
        props.valueType === "enum" && (React.createElement(React.Fragment, null,
            props.valueData.length > 10 && (React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(TextField, { value: enumFilterSearch, onChange: function (evt) {
                        return setEnumFilterSearch(evt.target.value);
                    }, placeholder: t("standalone.data-grid.content.set-filter.search"), fullWidth: true, autoFocus: depth === 1 }))),
            React.createElement(Grid, { item: true, xs: 12, className: classes.setFilterContainer },
                React.createElement(List, null,
                    props.valueData.length > 5 && (React.createElement(ListItem, { className: classes.setFilterListItem },
                        React.createElement(Checkbox, { checked: filterValue.split(",").sort().join(",") ===
                                props.valueData
                                    .filter(function (entry) { return !entry.isDivider; })
                                    .map(function (entry) { return entry.value || ENUM_FILTER_MAGIC_EMPTY; })
                                    .sort()
                                    .join(","), onChange: onFilterValueChangeEnumAll }),
                        React.createElement(ListItemText, null, t("standalone.data-grid.content.set-filter.select-all")))),
                    props.valueData
                        .filter(function (entry) {
                        return entry
                            .getLabelText()
                            .toLowerCase()
                            .includes(enumFilterSearch.toLocaleLowerCase());
                    })
                        .map(function (entry) { return (React.createElement(ListItem, { key: entry.value, className: entry.isDivider
                            ? classes.setFilterListItemDivider
                            : classes.setFilterListItem }, entry.isDivider ? (React.createElement(Divider, { className: classes.setFilterListDivider })) : (React.createElement(React.Fragment, null,
                        React.createElement(Checkbox, { value: entry.value || ENUM_FILTER_MAGIC_EMPTY, checked: filterValue
                                .split(",")
                                .includes(entry.value || ENUM_FILTER_MAGIC_EMPTY), onChange: onFilterValueChangeEnum, disabled: entry.disabled }),
                        React.createElement(ListItemText, null, (entry.getLabel || entry.getLabelText)()))))); }))))),
        filterValue &&
            props.valueType !== "enum" &&
            props.valueType !== "boolean" &&
            (!maxDepth || depth <= maxDepth) && (React.createElement(React.Fragment, null,
            React.createElement(FilterCombinator, { value: subFilterComboType, onChange: onSubFilterTypeChange }),
            React.createElement(FilterEntry, { onChange: onSubFilterChange, valueType: props.valueType, valueData: props.valueData, value: subFilter, close: close, depth: depth + 1 })))));
};
export default React.memo(FilterEntry);
