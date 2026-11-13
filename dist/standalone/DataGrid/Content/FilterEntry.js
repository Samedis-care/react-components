import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { Checkbox, FormControl, FormControlLabel, Grid, List, MenuItem, Radio, RadioGroup, Select, TextField, Tooltip, } from "@mui/material";
import { Delete as ClearIcon } from "@mui/icons-material";
import FilterCombinator from "./FilterCombinator";
import { DataGridFilterClearButton, DataGridIdFilterContainer, DataGridSetFilterContainer, DataGridSetFilterListDivider, DataGridSetFilterListItem, DataGridSetFilterListItemDivider, useDataGridProps, } from "../DataGrid";
import { LocalizedDateTimePicker, LocalizedKeyboardDatePicker, } from "../../LocalizedDateTimePickers";
import useCCTranslations from "../../../utils/useCCTranslations";
import { denormalizeDate, normalizeDate, parseDateOnly, } from "../../../utils/dateOnlyUtils";
import moment from "moment";
import { BackendMultiSelect } from "../../../backend-components";
/**
 * A custom filter's value1 is what its setFilter stored, as JSON. A value1 that
 * is not JSON (from a URL, a defaultFilter, or stored while the column had
 * another filter type) opens as no filter instead of throwing during render.
 * @param value The stored filter value
 * @returns The parsed filter, or undefined if there is none or it is not JSON
 */
const customFilterValue = (value) => {
    if (!value)
        return undefined;
    try {
        return JSON.parse(value);
    }
    catch {
        return undefined;
    }
};
/**
 * Date filter values are stored as date-only values (12:00 UTC) — show them by
 * their UTC day, so the day doesn't shift in timezones at or beyond UTC+12.
 * @param value The stored filter value
 * @returns The value for the date picker
 */
const dateFilterValue = (value) => value === "" ? null : moment(denormalizeDate(parseDateOnly(value)));
const ENUM_FILTER_MAGIC_EMPTY = "__MAGIC_EMPTY__";
const LIST_ITEM_LABEL_SLOT_PROPS = { typography: { noWrap: true } };
/**
 * The values "Select all" ticks: every entry of an enum filter except the
 * dividers, with the empty value as ENUM_FILTER_MAGIC_EMPTY
 * @param data The enum column's filter data
 * @returns The values, in the order of the list
 */
const enumFilterValues = (data) => data
    .filter((entry) => !entry.isDivider)
    .map((entry) => entry.value || ENUM_FILTER_MAGIC_EMPTY);
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
    // ID columns without filter data can't render the ID selector, fall back to manual ID entry
    const manualIdEntry = props.valueType === "id" && !props.valueData;
    const defaultFilterType = (() => {
        const defaults = [
            "string",
            "localized-string",
            "combined-string",
        ].includes(props.valueType ?? "")
            ? ["startsWith", "contains", "equals", "matches"]
            : ["enum", "id"].includes(props.valueType ?? "") && !manualIdEntry
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
            filterValue = enumFilterValues(props.valueData).join(",");
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
    const onFilterValue2ChangeDateTime = (date) => {
        filterValue2 = date?.isValid() ? date.toDate().toISOString() : "";
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
    // "Select all": checked when every value is ticked, mixed when some are
    const enumValues = props.valueType === "enum"
        ? enumFilterValues(props.valueData)
        : [];
    const enumTicked = filterValue ? filterValue.split(",") : [];
    const enumAllTicked = filterValue.split(",").sort().join(",") ===
        [...enumValues].sort().join(",");
    const enumSomeTicked = !enumAllTicked && enumValues.some((value) => enumTicked.includes(value));
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
        return React.createElement(customFilterData.filterComponent, {
            filter: customFilterValue(props.value?.value1),
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
                props.valueType === "datetime" ||
                manualIdEntry) && (_jsxs(_Fragment, { children: [_jsx(Grid, { size: 12, children: _jsx(Select, { onChange: onFilterTypeChange, value: filterType, fullWidth: true, children: filterTypeMenuItems }) }), filterType !== "empty" && filterType !== "notEmpty" && (_jsx(Grid, { size: 12, children: props.valueType === "date" ? (_jsx(LocalizedKeyboardDatePicker, { value: dateFilterValue(filterValue), onChange: onFilterValueChangeDate, fullWidth: true, autoFocus: depth === 1 })) : props.valueType === "datetime" ? (_jsx(LocalizedDateTimePicker, { value: filterValue === "" ? null : moment(filterValue), onChange: onFilterValueChangeDateTime, fullWidth: true, autoFocus: depth === 1 })) : (_jsx(TextField, { value: filterValue, onChange: onFilterValueChange, fullWidth: true, autoFocus: depth === 1 })) })), filterType === "inRange" && (_jsx(Grid, { size: 12, children: props.valueType === "date" ? (_jsx(LocalizedKeyboardDatePicker, { value: dateFilterValue(filterValue2), onChange: onFilterValue2ChangeDate })) : props.valueType === "datetime" ? (_jsx(LocalizedDateTimePicker, { value: filterValue2 === "" ? null : moment(filterValue2), onChange: onFilterValue2ChangeDateTime })) : (_jsx(TextField, { value: filterValue2, onChange: onFilterValue2Change, fullWidth: true })) }))] })), props.valueType === "boolean" && (_jsx(Grid, { size: 12, children: _jsx(FormControl, { children: _jsxs(RadioGroup, { value: filterValue, onChange: onFilterValueChangeBool, children: [_jsx(FormControlLabel, { value: "", control: _jsx(Radio, {}), label: t("standalone.data-grid.content.bool-filter.any") }), _jsx(FormControlLabel, { value: "true", control: _jsx(Radio, {}), label: t("standalone.data-grid.content.bool-filter.true") }), _jsx(FormControlLabel, { value: "false", control: _jsx(Radio, {}), label: t("standalone.data-grid.content.bool-filter.false") })] }) }) })), props.valueType === "enum" && (_jsxs(_Fragment, { children: [props.valueData.length > 10 && (_jsx(Grid, { size: 12, children: _jsx(TextField, { value: enumFilterSearch, onChange: (evt) => setEnumFilterSearch(evt.target.value), placeholder: t("standalone.data-grid.content.set-filter.search"), fullWidth: true, autoFocus: depth === 1 }) })), _jsx(DataGridSetFilterContainer, { size: 12, className: classes?.setFilterContainer, role: "group", "aria-label": t("standalone.data-grid.content.set-filter.label"), children: _jsxs(List, { children: [props.valueData.length > 5 && (_jsx(DataGridSetFilterListItem, { className: classes?.setFilterListItem, children: _jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: enumAllTicked, indeterminate: enumSomeTicked, onChange: onFilterValueChangeEnumAll }), label: t("standalone.data-grid.content.set-filter.select-all"), slotProps: LIST_ITEM_LABEL_SLOT_PROPS }) })), checkSupport(props.valueType, "notInSet") && (_jsxs(_Fragment, { children: [_jsx(DataGridSetFilterListItem, { className: classes?.setFilterListItem, children: _jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: enumFilterInverted, onChange: onFilterTypeChangeEnum }), label: t("standalone.data-grid.content.set-filter.invert"), slotProps: LIST_ITEM_LABEL_SLOT_PROPS }) }), _jsx(DataGridSetFilterListItemDivider, { className: classes?.setFilterListItemDivider, children: _jsx(DataGridSetFilterListDivider, { className: classes?.setFilterListDivider }) })] })), props.valueData
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
                                            : classes?.setFilterListItem, children: entry.isDivider ? (_jsx(DataGridSetFilterListDivider, { className: classes?.setFilterListDivider })) : (_jsx(FormControlLabel, { control: _jsx(Checkbox, { value: entry.value || ENUM_FILTER_MAGIC_EMPTY, checked: enumTicked.includes(entry.value || ENUM_FILTER_MAGIC_EMPTY), onChange: onFilterValueChangeEnum, disabled: entry.disabled }), label: (entry.getLabel || entry.getLabelText)(), slotProps: LIST_ITEM_LABEL_SLOT_PROPS })) }, entry.value));
                                })] }) })] })), props.valueType === "id" && !manualIdEntry && (_jsx(_Fragment, { children: _jsxs(DataGridIdFilterContainer, { size: 12, className: classes?.idFilterContainer, children: [checkSupport(props.valueType, "notInSet") && (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: enumFilterInverted, onChange: onFilterTypeChangeEnum }), label: t("standalone.data-grid.content.set-filter.invert") })), _jsx(BackendMultiSelect, { ...props.valueData, selected: filterValue ? filterValue.split(",") : [], onSelect: handleIdFilterSelect, confirmDelete: false })] }) })), filterValue &&
                props.valueType !== "enum" &&
                (props.valueType !== "id" || manualIdEntry) &&
                props.valueType !== "boolean" &&
                (!maxDepth || depth <= maxDepth) && (_jsxs(_Fragment, { children: [_jsx(FilterCombinator, { value: subFilterComboType, onChange: onSubFilterTypeChange }), _jsx(FilterEntry, { field: props.field, onChange: onSubFilterChange, valueType: props.valueType, valueData: props.valueData, value: subFilter, close: close, depth: depth + 1 })] }))] }));
};
export default React.memo(FilterEntry);
