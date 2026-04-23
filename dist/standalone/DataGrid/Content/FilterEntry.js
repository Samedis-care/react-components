import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { Checkbox, FormControl, FormControlLabel, Grid, List, ListItemText, MenuItem, Radio, RadioGroup, Select, TextField, Tooltip, } from "@mui/material";
import { Delete as ClearIcon } from "@mui/icons-material";
import FilterCombinator from "./FilterCombinator";
import { DataGridFilterClearButton, DataGridIdFilterContainer, DataGridSetFilterContainer, DataGridSetFilterListDivider, DataGridSetFilterListItem, DataGridSetFilterListItemDivider, useDataGridProps, } from "../DataGrid";
import { LocalizedDateTimePicker, LocalizedKeyboardDatePicker, } from "../../LocalizedDateTimePickers";
import useCCTranslations from "../../../utils/useCCTranslations";
import { normalizeDate } from "../../../backend-integration/Model/Types/Utils/DateUtils";
import moment from "moment";
import { BackendMultiSelect } from "../../../backend-components";
const ENUM_FILTER_MAGIC_EMPTY = "__MAGIC_EMPTY__";
const LIST_ITEM_SLOT_PROPS = { primary: { noWrap: true } };
const FilterEntry = (props) => {
    const { onChange, depth, close } = props;
    const isFirstFilter = depth === 1;
    const { t } = useCCTranslations();
    const { filterLimit, isFilterSupported, classes } = useDataGridProps();
    const checkSupport = (dataType, filterType) => {
        if (!isFilterSupported)
            return true;
        return isFilterSupported(dataType, filterType, props.field);
    };
    const [enumFilterSearch, setEnumFilterSearch] = useState("");
    const maxDepth = filterLimit;
    const defaultFilterType = (() => {
        const defaults = [
            "string",
            "localized-string",
            "combined-string",
        ].includes(props.valueType ?? "")
            ? ["startsWith", "contains", "equals", "matches"]
            : ["enum", "id"].includes(props.valueType ?? "")
                ? ["inSet"]
                : ["equals", "matches"];
        return (
        // fallback to broken UI, user can still select filter type manually
        defaults.find((filterType) => checkSupport(props.valueType, filterType)) || defaults[0]);
    })();
    let filterType = props.value?.type || defaultFilterType;
    let filterValue = props.value?.value1 || "";
    let filterValue2 = props.value?.value2 || "";
    let subFilterComboType = props.value?.nextFilterType || "and";
    let subFilter = props.value?.nextFilter || undefined;
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
    const onFilterValueChangeDateTime = (date) => {
        filterValue = "";
        if (!date) {
            subFilterComboType = "and";
            subFilter = undefined;
        }
        else if (date.isValid()) {
            filterValue = date.toDate().toISOString();
        }
        updateParent();
    };
    const onFilterValueChangeBool = (evt) => {
        filterType = "equals";
        filterValue = evt.currentTarget.value;
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
    const handleIdFilterSelect = (selected) => {
        filterValue = selected.join(",");
        updateParent();
    };
    let filterTypeMenuItems = [
        checkSupport(props.valueType, "equals") && (_jsx(MenuItem, { value: "equals", children: t("standalone.data-grid.content.filter-type.eq") }, "equals")),
        checkSupport(props.valueType, "notEqual") && (_jsx(MenuItem, { value: "notEqual", children: t("standalone.data-grid.content.filter-type.not-eq") }, "notEqual")),
        checkSupport(props.valueType, "empty") && (_jsx(MenuItem, { value: "empty", children: t("standalone.data-grid.content.filter-type.empty") }, "empty")),
        checkSupport(props.valueType, "notEmpty") && (_jsx(MenuItem, { value: "notEmpty", children: t("standalone.data-grid.content.filter-type.not-empty") }, "notEmpty")),
    ];
    if (["string", "localized-string", "combined-string"].includes(props.valueType ?? "")) {
        filterTypeMenuItems.push(checkSupport(props.valueType, "matches") && (_jsx(MenuItem, { value: "matches", children: t("standalone.data-grid.content.filter-type.matches") }, "matches")), checkSupport(props.valueType, "notMatches") && (_jsx(MenuItem, { value: "notMatches", children: t("standalone.data-grid.content.filter-type.not-matches") }, "notMatches")), checkSupport(props.valueType, "contains") && (_jsx(MenuItem, { value: "contains", children: t("standalone.data-grid.content.filter-type.contains") }, "contains")), checkSupport(props.valueType, "notContains") && (_jsx(MenuItem, { value: "notContains", children: t("standalone.data-grid.content.filter-type.not-contains") }, "notContains")), checkSupport(props.valueType, "startsWith") && (_jsx(MenuItem, { value: "startsWith", children: t("standalone.data-grid.content.filter-type.starts-with") }, "startsWith")), checkSupport(props.valueType, "endsWith") && (_jsx(MenuItem, { value: "endsWith", children: t("standalone.data-grid.content.filter-type.ends-with") }, "endsWith")));
    }
    else if (props.valueType === "number") {
        filterTypeMenuItems.push(checkSupport(props.valueType, "lessThan") && (_jsx(MenuItem, { value: "lessThan", children: t("standalone.data-grid.content.filter-type.lt") }, "lessThan")), checkSupport(props.valueType, "lessThanOrEqual") && (_jsx(MenuItem, { value: "lessThanOrEqual", children: t("standalone.data-grid.content.filter-type.lte") }, "lessThanOrEqual")), checkSupport(props.valueType, "greaterThan") && (_jsx(MenuItem, { value: "greaterThan", children: t("standalone.data-grid.content.filter-type.gt") }, "greaterThan")), checkSupport(props.valueType, "greaterThanOrEqual") && (_jsx(MenuItem, { value: "greaterThanOrEqual", children: t("standalone.data-grid.content.filter-type.gte") }, "greaterThanOrEqual")), checkSupport(props.valueType, "inRange") && (_jsx(MenuItem, { value: "inRange", children: t("standalone.data-grid.content.filter-type.in-range") }, "inRange")));
    }
    else if (props.valueType === "date" || props.valueType === "datetime") {
        filterTypeMenuItems.push(checkSupport(props.valueType, "lessThan") && (_jsx(MenuItem, { value: "lessThan", children: t("standalone.data-grid.content.filter-type.lt-date") }, "lessThan")), checkSupport(props.valueType, "lessThanOrEqual") && (_jsx(MenuItem, { value: "lessThanOrEqual", children: t("standalone.data-grid.content.filter-type.lte-date") }, "lessThanOrEqual")), checkSupport(props.valueType, "greaterThan") && (_jsx(MenuItem, { value: "greaterThan", children: t("standalone.data-grid.content.filter-type.gt-date") }, "greaterThan")), checkSupport(props.valueType, "greaterThanOrEqual") && (_jsx(MenuItem, { value: "greaterThanOrEqual", children: t("standalone.data-grid.content.filter-type.gte-date") }, "greaterThanOrEqual")), checkSupport(props.valueType, "inRange") && (_jsx(MenuItem, { value: "inRange", children: t("standalone.data-grid.content.filter-type.in-range-date") }, "inRange")));
    }
    filterTypeMenuItems = filterTypeMenuItems.filter((e) => e);
    // filter type custom
    const setCustomFilter = useCallback((customFilter) => {
        onChange({
            type: "equals",
            value1: JSON.stringify(customFilter),
            value2: "",
        });
    }, [onChange]);
    if (isFirstFilter && props.valueType === "custom") {
        const customFilterData = props.valueData;
        const customFilterValue = props.value?.value1
            ? JSON.parse(props.value?.value1)
            : undefined;
        return React.createElement(customFilterData.filterComponent, {
            filter: customFilterValue,
            setFilter: setCustomFilter,
            close,
        });
    }
    // END filter type custom
    return (_jsxs(_Fragment, { children: [isFirstFilter && props.value?.value1 && (_jsx(Grid, { size: 12, children: _jsx(Grid, { container: true, sx: { justifyContent: "flex-end", alignItems: "center" }, children: _jsx(Grid, { children: _jsx(Tooltip, { title: t("standalone.data-grid.content.reset-column-filter") ?? "", children: _jsx("span", { children: _jsx(DataGridFilterClearButton, { className: classes?.filterClearBtn, onClick: resetFilter, size: "large", children: _jsx(ClearIcon, {}) }) }) }) }) }) })), (props.valueType === "string" ||
                props.valueType === "localized-string" ||
                props.valueType === "combined-string" ||
                props.valueType === "number" ||
                props.valueType === "date" ||
                props.valueType === "datetime") && (_jsxs(_Fragment, { children: [_jsx(Grid, { size: 12, children: _jsx(Select, { onChange: onFilterTypeChange, value: filterType, fullWidth: true, children: filterTypeMenuItems }) }), filterType !== "empty" && filterType !== "notEmpty" && (_jsx(Grid, { size: 12, children: props.valueType === "date" ? (_jsx(LocalizedKeyboardDatePicker, { value: filterValue === "" ? null : moment(filterValue), onChange: onFilterValueChangeDate, fullWidth: true, autoFocus: depth === 1 })) : props.valueType === "datetime" ? (_jsx(LocalizedDateTimePicker, { value: filterValue === "" ? null : moment(filterValue), onChange: onFilterValueChangeDateTime, fullWidth: true, autoFocus: depth === 1 })) : (_jsx(TextField, { value: filterValue, onChange: onFilterValueChange, fullWidth: true, autoFocus: depth === 1 })) })), filterType === "inRange" && (_jsx(Grid, { size: 12, children: props.valueType === "date" ? (_jsx(LocalizedKeyboardDatePicker, { value: filterValue2 === "" ? null : moment(filterValue2), onChange: onFilterValue2ChangeDate })) : props.valueType === "datetime" ? (_jsx(LocalizedDateTimePicker, { value: filterValue2 === "" ? null : moment(filterValue2), onChange: onFilterValueChangeDateTime })) : (_jsx(TextField, { value: filterValue2, onChange: onFilterValue2Change, fullWidth: true })) }))] })), props.valueType === "boolean" && (_jsx(Grid, { size: 12, children: _jsx(FormControl, { children: _jsxs(RadioGroup, { value: filterValue, onChange: onFilterValueChangeBool, children: [_jsx(FormControlLabel, { value: "", control: _jsx(Radio, {}), label: t("standalone.data-grid.content.bool-filter.any") }), _jsx(FormControlLabel, { value: "true", control: _jsx(Radio, {}), label: t("standalone.data-grid.content.bool-filter.true") }), _jsx(FormControlLabel, { value: "false", control: _jsx(Radio, {}), label: t("standalone.data-grid.content.bool-filter.false") })] }) }) })), props.valueType === "enum" && (_jsxs(_Fragment, { children: [props.valueData.length > 10 && (_jsx(Grid, { size: 12, children: _jsx(TextField, { value: enumFilterSearch, onChange: (evt) => setEnumFilterSearch(evt.target.value), placeholder: t("standalone.data-grid.content.set-filter.search"), fullWidth: true, autoFocus: depth === 1 }) })), _jsx(DataGridSetFilterContainer, { size: 12, className: classes?.setFilterContainer, children: _jsxs(List, { children: [props.valueData.length > 5 && (_jsxs(DataGridSetFilterListItem, { className: classes?.setFilterListItem, children: [_jsx(Checkbox, { checked: filterValue.split(",").sort().join(",") ===
                                                props.valueData
                                                    .filter((entry) => !entry.isDivider)
                                                    .map((entry) => entry.value || ENUM_FILTER_MAGIC_EMPTY)
                                                    .sort()
                                                    .join(","), onChange: onFilterValueChangeEnumAll }), _jsx(ListItemText, { slotProps: LIST_ITEM_SLOT_PROPS, children: t("standalone.data-grid.content.set-filter.select-all") })] })), checkSupport(props.valueType, "notInSet") && (_jsxs(_Fragment, { children: [_jsxs(DataGridSetFilterListItem, { className: classes?.setFilterListItem, children: [_jsx(Checkbox, { checked: enumFilterInverted, onChange: onFilterTypeChangeEnum }), _jsx(ListItemText, { slotProps: LIST_ITEM_SLOT_PROPS, children: t("standalone.data-grid.content.set-filter.invert") })] }), _jsx(DataGridSetFilterListItemDivider, { className: classes?.setFilterListItemDivider, children: _jsx(DataGridSetFilterListDivider, { className: classes?.setFilterListDivider }) })] })), props.valueData
                                    .filter((entry) => entry
                                    .getLabelText()
                                    .toLowerCase()
                                    .includes(enumFilterSearch.toLocaleLowerCase()))
                                    .map((entry) => {
                                    const ListItemComp = entry.isDivider
                                        ? DataGridSetFilterListItemDivider
                                        : DataGridSetFilterListItem;
                                    return (_jsx(ListItemComp, { className: entry.isDivider
                                            ? classes?.setFilterListItemDivider
                                            : classes?.setFilterListItem, children: entry.isDivider ? (_jsx(DataGridSetFilterListDivider, { className: classes?.setFilterListDivider })) : (_jsxs(_Fragment, { children: [_jsx(Checkbox, { value: entry.value || ENUM_FILTER_MAGIC_EMPTY, checked: filterValue
                                                        .split(",")
                                                        .includes(entry.value || ENUM_FILTER_MAGIC_EMPTY), onChange: onFilterValueChangeEnum, disabled: entry.disabled }), _jsx(ListItemText, { slotProps: LIST_ITEM_SLOT_PROPS, children: (entry.getLabel || entry.getLabelText)() })] })) }, entry.value));
                                })] }) })] })), props.valueType === "id" && (_jsx(_Fragment, { children: _jsxs(DataGridIdFilterContainer, { size: 12, className: classes?.idFilterContainer, children: [checkSupport(props.valueType, "notInSet") && (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: enumFilterInverted, onChange: onFilterTypeChangeEnum }), label: t("standalone.data-grid.content.set-filter.invert") })), _jsx(BackendMultiSelect, { ...props.valueData, selected: filterValue ? filterValue.split(",") : [], onSelect: handleIdFilterSelect, confirmDelete: false })] }) })), filterValue &&
                props.valueType !== "enum" &&
                props.valueType !== "id" &&
                props.valueType !== "boolean" &&
                (!maxDepth || depth <= maxDepth) && (_jsxs(_Fragment, { children: [_jsx(FilterCombinator, { value: subFilterComboType, onChange: onSubFilterTypeChange }), _jsx(FilterEntry, { field: props.field, onChange: onSubFilterChange, valueType: props.valueType, valueData: props.valueData, value: subFilter, close: close, depth: depth + 1 })] }))] }));
};
export default React.memo(FilterEntry);
