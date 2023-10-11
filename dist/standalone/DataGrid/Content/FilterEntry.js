import React, { useCallback, useState } from "react";
import { Checkbox, Divider, FormControlLabel, Grid, IconButton, List, ListItem, ListItemText, MenuItem, Select, TextField, Tooltip, } from "@mui/material";
import { Delete as ClearIcon } from "@mui/icons-material";
import FilterCombinator from "./FilterCombinator";
import { useDataGridProps, useDataGridStyles, } from "../DataGrid";
import { LocalizedDateTimePicker, LocalizedKeyboardDatePicker, } from "../../LocalizedDateTimePickers";
import useCCTranslations from "../../../utils/useCCTranslations";
import { normalizeDate } from "../../../backend-integration/Model/Types/Utils/DateUtils";
import moment from "moment";
const ENUM_FILTER_MAGIC_EMPTY = "__MAGIC_EMPTY__";
const TYPOGRAPHY_PROPS = { noWrap: true };
const FilterEntry = (props) => {
    const { onChange, depth, close } = props;
    const isFirstFilter = depth === 1;
    const { t } = useCCTranslations();
    const { filterLimit, isFilterSupported } = useDataGridProps();
    const [enumFilterSearch, setEnumFilterSearch] = useState("");
    const classes = useDataGridStyles();
    const maxDepth = filterLimit;
    const defaultFilterType = [
        "string",
        "localized-string",
        "combined-string",
    ].includes(props.valueType ?? "")
        ? "contains"
        : props.valueType === "enum"
            ? "inSet"
            : "equals";
    let filterType = props.value?.type || defaultFilterType;
    let filterValue = props.value?.value1 || "";
    let filterValue2 = props.value?.value2 || "";
    let subFilterComboType = props.value?.nextFilterType || "and";
    let subFilter = props.value?.nextFilter || undefined;
    const checkSupport = (dataType, filterType) => {
        if (!isFilterSupported)
            return true;
        return isFilterSupported(dataType, filterType, props.field);
    };
    const resetFilter = useCallback(() => {
        onChange({ type: defaultFilterType, value1: "", value2: "" });
        close();
    }, [close, onChange, defaultFilterType]);
    const updateParent = () => onChange({
        type: filterType,
        value1: filterValue,
        value2: filterValue2,
        nextFilterType: subFilterComboType,
        nextFilter: subFilter,
    });
    const onFilterTypeChange = (event) => {
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
    const enumFilterInverted = ["notEmpty", "notInSet"].includes(filterType);
    const onFilterTypeChangeEnum = (_, checked) => {
        filterType = checked ? "notInSet" : "inSet";
        updateParent();
    };
    const onFilterValueChange = (event) => {
        filterValue = event.target.value;
        if (!filterValue) {
            subFilterComboType = "and";
            subFilter = undefined;
        }
        updateParent();
    };
    const onFilterValueChangeDate = (date) => {
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
    const onFilterValueChangeBool = () => {
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
    const handleNullEnum = () => {
        // deal with empty/null enum values by using empty/notEmpty filter (possibly chained via OR or AND if inverted)
        const split = filterValue.split(",");
        const hasEmpty = split.includes(ENUM_FILTER_MAGIC_EMPTY);
        const isInverted = ["notEmpty", "notInSet"].includes(filterType);
        if (split.length === 1) {
            filterType = isInverted
                ? hasEmpty
                    ? "notEmpty"
                    : "notInSet"
                : hasEmpty
                    ? "empty"
                    : "inSet";
            subFilter = undefined;
        }
        else if (hasEmpty) {
            filterType = isInverted ? "notInSet" : "inSet";
            subFilterComboType = isInverted ? "and" : "or";
            subFilter = {
                type: isInverted ? "notEmpty" : "empty",
                value1: isInverted ? "notEmpty" : "empty",
                value2: "",
                nextFilter: undefined,
                nextFilterType: undefined,
            };
        }
    };
    const onFilterValueChangeEnumAll = (_, checked) => {
        if (checked) {
            filterValue = props.valueData
                .filter((entry) => !entry.isDivider)
                .map((entry) => entry.value || ENUM_FILTER_MAGIC_EMPTY)
                .join(",");
        }
        else {
            filterValue = "";
        }
        handleNullEnum();
        updateParent();
    };
    const onFilterValueChangeEnum = (evt, checked) => {
        let currentlyChecked = filterValue.length === 0 ? [] : filterValue.split(",");
        if (!checked) {
            currentlyChecked = currentlyChecked.filter((val) => val !== evt.target.value);
        }
        else {
            currentlyChecked.push(evt.target.value);
        }
        filterValue = currentlyChecked.join(",");
        handleNullEnum();
        updateParent();
    };
    const onFilterValue2Change = (event) => {
        filterValue2 = event.target.value;
        updateParent();
    };
    const onFilterValue2ChangeDate = (date) => {
        filterValue2 = date ? normalizeDate(date.toDate()).toISOString() : "";
        updateParent();
    };
    const onSubFilterTypeChange = (value) => {
        subFilterComboType = value;
        updateParent();
    };
    const onSubFilterChange = (value) => {
        subFilter = value;
        updateParent();
    };
    let filterTypeMenuItems = [
        checkSupport(props.valueType, "equals") && (React.createElement(MenuItem, { key: "equals", value: "equals" }, t("standalone.data-grid.content.filter-type.eq"))),
        checkSupport(props.valueType, "notEqual") && (React.createElement(MenuItem, { key: "notEqual", value: "notEqual" }, t("standalone.data-grid.content.filter-type.not-eq"))),
        checkSupport(props.valueType, "empty") && (React.createElement(MenuItem, { key: "empty", value: "empty" }, t("standalone.data-grid.content.filter-type.empty"))),
        checkSupport(props.valueType, "notEmpty") && (React.createElement(MenuItem, { key: "notEmpty", value: "notEmpty" }, t("standalone.data-grid.content.filter-type.not-empty"))),
    ];
    if (["string", "localized-string", "combined-string"].includes(props.valueType ?? "")) {
        filterTypeMenuItems.push(checkSupport(props.valueType, "contains") && (React.createElement(MenuItem, { key: "contains", value: "contains" }, t("standalone.data-grid.content.filter-type.contains"))), checkSupport(props.valueType, "notContains") && (React.createElement(MenuItem, { key: "notContains", value: "notContains" }, t("standalone.data-grid.content.filter-type.not-contains"))), checkSupport(props.valueType, "startsWith") && (React.createElement(MenuItem, { key: "startsWith", value: "startsWith" }, t("standalone.data-grid.content.filter-type.starts-with"))), checkSupport(props.valueType, "endsWith") && (React.createElement(MenuItem, { key: "endsWith", value: "endsWith" }, t("standalone.data-grid.content.filter-type.ends-with"))));
    }
    else if (props.valueType === "number") {
        filterTypeMenuItems.push(checkSupport(props.valueType, "lessThan") && (React.createElement(MenuItem, { key: "lessThan", value: "lessThan" }, t("standalone.data-grid.content.filter-type.lt"))), checkSupport(props.valueType, "lessThanOrEqual") && (React.createElement(MenuItem, { key: "lessThanOrEqual", value: "lessThanOrEqual" }, t("standalone.data-grid.content.filter-type.lte"))), checkSupport(props.valueType, "greaterThan") && (React.createElement(MenuItem, { key: "greaterThan", value: "greaterThan" }, t("standalone.data-grid.content.filter-type.gt"))), checkSupport(props.valueType, "greaterThanOrEqual") && (React.createElement(MenuItem, { key: "greaterThanOrEqual", value: "greaterThanOrEqual" }, t("standalone.data-grid.content.filter-type.gte"))), checkSupport(props.valueType, "inRange") && (React.createElement(MenuItem, { key: "inRange", value: "inRange" }, t("standalone.data-grid.content.filter-type.in-range"))));
    }
    else if (props.valueType === "date" || props.valueType === "datetime") {
        filterTypeMenuItems.push(checkSupport(props.valueType, "lessThan") && (React.createElement(MenuItem, { key: "lessThan", value: "lessThan" }, t("standalone.data-grid.content.filter-type.lt-date"))), checkSupport(props.valueType, "lessThanOrEqual") && (React.createElement(MenuItem, { key: "lessThanOrEqual", value: "lessThanOrEqual" }, t("standalone.data-grid.content.filter-type.lte-date"))), checkSupport(props.valueType, "greaterThan") && (React.createElement(MenuItem, { key: "greaterThan", value: "greaterThan" }, t("standalone.data-grid.content.filter-type.gt-date"))), checkSupport(props.valueType, "greaterThanOrEqual") && (React.createElement(MenuItem, { key: "greaterThanOrEqual", value: "greaterThanOrEqual" }, t("standalone.data-grid.content.filter-type.gte-date"))), checkSupport(props.valueType, "inRange") && (React.createElement(MenuItem, { key: "inRange", value: "inRange" }, t("standalone.data-grid.content.filter-type.in-range-date"))));
    }
    filterTypeMenuItems = filterTypeMenuItems.filter((e) => e);
    return (React.createElement(React.Fragment, null,
        isFirstFilter && props.value?.value1 && (React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Grid, { container: true, justifyContent: "flex-end", alignItems: "center" },
                React.createElement(Grid, { item: true },
                    React.createElement(Tooltip, { title: t("standalone.data-grid.content.reset-column-filter") ?? "" },
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
            React.createElement(FormControlLabel, { control: React.createElement(Checkbox, { checked: filterValue === "true", onClick: onFilterValueChangeBool, indeterminate: !filterValue, autoFocus: depth === 1 }), label: (() => {
                    if (!filterValue)
                        return t("standalone.data-grid.content.bool-filter.any");
                    const entry = props.valueData?.find((entry) => entry.value === filterValue);
                    if (!entry)
                        return t("standalone.data-grid.content.bool-filter." + filterValue);
                    return (entry.getLabel ?? entry.getLabelText)();
                })() }))),
        props.valueType === "enum" && (React.createElement(React.Fragment, null,
            props.valueData.length > 10 && (React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(TextField, { value: enumFilterSearch, onChange: (evt) => setEnumFilterSearch(evt.target.value), placeholder: t("standalone.data-grid.content.set-filter.search"), fullWidth: true, autoFocus: depth === 1 }))),
            React.createElement(Grid, { item: true, xs: 12, className: classes.setFilterContainer },
                React.createElement(List, null,
                    props.valueData.length > 5 && (React.createElement(ListItem, { className: classes.setFilterListItem },
                        React.createElement(Checkbox, { checked: filterValue.split(",").sort().join(",") ===
                                props.valueData
                                    .filter((entry) => !entry.isDivider)
                                    .map((entry) => entry.value || ENUM_FILTER_MAGIC_EMPTY)
                                    .sort()
                                    .join(","), onChange: onFilterValueChangeEnumAll }),
                        React.createElement(ListItemText, { primaryTypographyProps: TYPOGRAPHY_PROPS }, t("standalone.data-grid.content.set-filter.select-all")))),
                    checkSupport(props.valueType, "notInSet") && (React.createElement(ListItem, { className: classes.setFilterListItem },
                        React.createElement(Checkbox, { checked: enumFilterInverted, onChange: onFilterTypeChangeEnum }),
                        React.createElement(ListItemText, { primaryTypographyProps: TYPOGRAPHY_PROPS }, t("standalone.data-grid.content.set-filter.invert")))),
                    props.valueData
                        .filter((entry) => entry
                        .getLabelText()
                        .toLowerCase()
                        .includes(enumFilterSearch.toLocaleLowerCase()))
                        .map((entry) => (React.createElement(ListItem, { key: entry.value, className: entry.isDivider
                            ? classes.setFilterListItemDivider
                            : classes.setFilterListItem }, entry.isDivider ? (React.createElement(Divider, { className: classes.setFilterListDivider })) : (React.createElement(React.Fragment, null,
                        React.createElement(Checkbox, { value: entry.value || ENUM_FILTER_MAGIC_EMPTY, checked: filterValue
                                .split(",")
                                .includes(entry.value || ENUM_FILTER_MAGIC_EMPTY), onChange: onFilterValueChangeEnum, disabled: entry.disabled }),
                        React.createElement(ListItemText, { primaryTypographyProps: TYPOGRAPHY_PROPS }, (entry.getLabel || entry.getLabelText)())))))))))),
        filterValue &&
            props.valueType !== "enum" &&
            props.valueType !== "boolean" &&
            (!maxDepth || depth <= maxDepth) && (React.createElement(React.Fragment, null,
            React.createElement(FilterCombinator, { value: subFilterComboType, onChange: onSubFilterTypeChange }),
            React.createElement(FilterEntry, { field: props.field, onChange: onSubFilterChange, valueType: props.valueType, valueData: props.valueData, value: subFilter, close: close, depth: depth + 1 })))));
};
export default React.memo(FilterEntry);
