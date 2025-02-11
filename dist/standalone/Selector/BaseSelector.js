import React, { useCallback, useEffect, useMemo, useState, } from "react";
import { Autocomplete, Divider, Grid, IconButton, InputAdornment, InputLabel, ListItemText, Paper, Popper, styled, Typography, useThemeProps, } from "@mui/material";
import { Add as AddIcon, ExpandMore, Info as InfoIcon, } from "@mui/icons-material";
import TextFieldWithHelp from "../UIKit/TextFieldWithHelp";
import { SelectorSmallListItemButton, SmallListItemIcon, } from "../../standalone/Small";
import combineClassNames from "../../utils/combineClassNames";
import { useLocalStorageState } from "../../utils/useStorageState";
import InlineSwitch from "../InlineSwitch";
import useCCTranslations from "../../utils/useCCTranslations";
import uniqueArray from "../../utils/uniqueArray";
import Checkbox from "../UIKit/Checkbox";
export const getStringLabel = (data) => typeof data === "string"
    ? data
    : Array.isArray(data.label)
        ? data.label[0]
        : data.label;
export const getReactLabel = (data) => Array.isArray(data.label) ? data.label[1] : data.label;
export const modifyReactLabel = (data, cb) => ({
    ...data,
    label: [getStringLabel(data), cb(getReactLabel(data))],
});
/**
 * On load handler for selectors using a local dataset
 * Performs a case-insensitive label search
 * @param data The data set
 */
export const selectorLocalLoadHandler = (data) => (query) => {
    query = query.toLowerCase();
    return uniqueArray([
        ...data.filter((entry) => getStringLabel(entry).toLowerCase().startsWith(query)),
        ...data.filter((entry) => getStringLabel(entry).toLowerCase().includes(query)),
    ]);
};
const StyledAutocomplete = styled(Autocomplete, {
    name: "CcBaseSelector",
    slot: "autocomplete",
})({
    "& .MuiAutocomplete-option": {
        padding: 0,
        '&[aria-disabled="true"]': {
            opacity: 1,
        },
    },
});
const StyledInlineSwitch = styled(InlineSwitch, {
    name: "CcBaseSelector",
    slot: "inlineSwitch",
})({
    marginTop: 0,
    "& .CcInlineSwitch-switchWrapper": {
        marginTop: -30,
    },
});
const StyledLabel = styled(InputLabel, {
    name: "CcBaseSelector",
    slot: "label",
})({
    position: "relative",
    transform: "translate(0,0) scale(0.75)",
    zIndex: "unset",
});
const StyledIcon = styled("img", {
    name: "CcBaseSelector",
    slot: "icon",
})(({ ownerState: { iconSize } }) => ({
    width: iconSize ?? 32,
    height: iconSize ?? 32,
    objectFit: "contain",
}));
const StyledDivider = styled(Divider, {
    name: "CcBaseSelector",
    slot: "divider",
})({
    width: "100%",
});
const SmallLabelOption = styled(Typography, {
    name: "CcBaseSelector",
    slot: "smallLabel",
})(({ theme }) => ({
    paddingLeft: 16,
    paddingTop: 4,
    color: theme.palette.text.disabled,
}));
const StyledCheckbox = styled(Checkbox, {
    name: "CcBaseSelector",
    slot: "checkbox",
})({
    borderRadius: 4,
    width: 16,
    height: 16,
    marginRight: 10,
});
const SelectedMarker = styled(Grid, {
    name: "CcBaseSelector",
    slot: "selected",
})(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.secondary.main,
    padding: `calc(${theme.spacing(1)} / 2) ${theme.spacing(1)}`,
}));
export const BaseSelectorLruOptionCssClassName = "components-care-base-selector-lru-option";
const OptionListItem = styled(SelectorSmallListItemButton, {
    name: "CcBaseSelector",
    slot: "listItem",
})(({ theme }) => ({
    paddingLeft: "16px !important",
    paddingRight: "16px !important",
    paddingTop: 6,
    paddingBottom: 6,
    [`&.${BaseSelectorLruOptionCssClassName}`]: {
        backgroundColor: theme.palette.background.default,
        "&:hover": {
            backgroundColor: theme.palette.background.paper,
        },
    },
}));
const Wrapper = styled(Paper, { name: "CcBaseSelector", slot: "wrapper" })({});
const InfoButton = styled(IconButton, {
    name: "CcBaseSelector",
    slot: "infoBtn",
})({
    padding: 2,
    marginRight: -2,
});
const getOptionDisabled = (option) => !!(!option || option.isDisabled || option.isDivider || option.isSmallLabel);
const getOptionSelected = (option, value) => option.value === value.value;
const GrowPopper = React.forwardRef(function GrowPopperImpl(props, ref) {
    return (React.createElement(Popper, { ...props, ref: ref, style: { ...props.style, width: "unset", minWidth: props.style?.width } }));
});
export const BaseSelectorContext = React.createContext(null);
const BaseSelector = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcBaseSelector" });
    const { variant, refreshToken, onSelect, multiple, selected, label, disabled, required, error, warning, disableSearch, placeholder, autocompleteId, addNewLabel, onLoad, onAddNew, enableIcons, noOptionsText, loadingText, startTypingToSearchText, openText, closeText, clearText, disableClearable, openInfo, grouped, noGroupLabel, disableGroupSorting, groupSorter, switchLabel, lru, startAdornment, endAdornment, endAdornmentLeft, freeSolo, getIdOfData, filterIds, textFieldClasses, textFieldInputClasses, iconSize, classes, className, } = props;
    const getIdDefault = useCallback((data) => data.value, []);
    const getId = getIdOfData ?? getIdDefault;
    const defaultSwitchValue = !!(props.displaySwitch && props.defaultSwitchValue);
    const [switchValue, setSwitchValue] = useState(defaultSwitchValue);
    const { t } = useCCTranslations();
    const [open, setOpen] = useState(false);
    const actualAddNewLabel = addNewLabel || t("standalone.selector.add-new");
    const [selectorOptions, setSelectorOptions] = useState([]);
    const [loading, setLoading] = useState(null);
    const [query, setQuery] = useState("");
    const [lruIds, setLruIds] = useLocalStorageState(lru?.storageKey, [], (ret) => Array.isArray(ret) &&
        !ret.find((entry) => typeof entry !== "string"));
    const renderIcon = useCallback((icon) => typeof icon === "string" ? (React.createElement(StyledIcon, { src: icon, alt: "", ownerState: { iconSize }, className: classes?.icon })) : (icon), [iconSize, classes?.icon]);
    const defaultRenderer = useCallback((props, data, state) => {
        const { selected } = state;
        if (data.isDivider)
            return (React.createElement(StyledDivider, { component: "li", ...props, onClick: undefined, onMouseMove: undefined, onTouchStart: undefined, key: data.value, className: classes?.divider }));
        if (data.isSmallLabel)
            return (React.createElement(SmallLabelOption, { component: "li", ...props, key: data.value, onClick: undefined, onMouseMove: undefined, onTouchStart: undefined, variant: "caption", className: classes?.smallLabel }, getReactLabel(data)));
        return (React.createElement(OptionListItem, { component: "li", ...props, key: data.value, className: combineClassNames([
                classes?.listItem,
                data.className,
                props.className,
            ]), disabled: data.isDisabled },
            multiple && (React.createElement(SmallListItemIcon, null,
                React.createElement(StyledCheckbox, { checked: selected, className: classes?.checkbox }))),
            enableIcons && (React.createElement(SmallListItemIcon, null, renderIcon(data.icon))),
            React.createElement(ListItemText, null,
                React.createElement(Grid, { container: true },
                    React.createElement(Grid, { item: true, xs: true }, getReactLabel(data)),
                    data.selected && (React.createElement(SelectedMarker, { item: true, className: classes?.selected }, t("standalone.selector.base-selector.selected")))))));
    }, [
        multiple,
        classes?.divider,
        classes?.smallLabel,
        classes?.listItem,
        classes?.selected,
        classes?.checkbox,
        enableIcons,
        renderIcon,
        t,
    ]);
    const addToLru = useCallback((...addIds) => {
        if (!lru)
            return;
        setLruIds((prev) => [...addIds, ...prev.filter((id) => !addIds.includes(id))].slice(0, lru.count));
    }, [lru, setLruIds]);
    const onChangeHandler = useCallback(async (data) => {
        if (multiple
            ? !Array.isArray(data)
            : !data ||
                !["string", "object"].includes(typeof data) ||
                (typeof data === "object" && !("value" in data))) {
            if (data) {
                // eslint-disable-next-line no-console
                console.warn("[Components-Care] [BaseSelector] Unexpected value passed to handleOptionSelect:", data);
                return;
            }
        }
        const dataNormalized = multiple
            ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                data.map((entry) => typeof entry === "string"
                    ? {
                        value: entry,
                        label: entry,
                        freeSolo: true,
                    }
                    : entry)
            : data
                ? [
                    typeof data === "string"
                        ? {
                            value: data,
                            label: data,
                            freeSolo: true,
                        }
                        : data,
                ]
                : [];
        const selectedNormalized = multiple
            ? selected
            : selected
                ? [selected]
                : [];
        if (dataNormalized.length > 0 &&
            dataNormalized[dataNormalized.length - 1].isAddNewButton) {
            if (!onAddNew)
                return;
            const created = await onAddNew();
            if (!created)
                return;
            setSelectorOptions((old) => [created, ...old]);
            dataNormalized[dataNormalized.length - 1] = created;
        }
        if (onSelect) {
            if (multiple) {
                onSelect(dataNormalized);
            }
            else {
                onSelect(dataNormalized[0] ?? null);
            }
            if (multiple
                ? dataNormalized.length > selectedNormalized.length
                : dataNormalized.length > 0) {
                const lastRecord = dataNormalized[dataNormalized.length - 1];
                if (!lastRecord.freeSolo)
                    addToLru(getId(lastRecord));
            }
        }
    }, [onSelect, onAddNew, multiple, selected, addToLru, getId]);
    const context = useMemo(() => ({
        addToLru,
    }), [addToLru]);
    const onSearchHandler = useCallback(async (query) => {
        const addNewEntry = {
            value: "add-new-button",
            label: actualAddNewLabel,
            icon: React.createElement(AddIcon, null),
            isAddNewButton: true,
        };
        const loadTicket = Math.random().toString();
        setLoading(loadTicket);
        let results;
        const filteredLruIds = filterIds
            ? lruIds.filter((id) => !filterIds.includes(id))
            : lruIds;
        if (lru &&
            query === "" &&
            (filteredLruIds.length > 0 || lru.forceQuery)) {
            results = [
                onAddNew ? addNewEntry : undefined,
                filteredLruIds.length > 0 && onAddNew
                    ? {
                        label: "",
                        value: "lru-divider",
                        isDivider: true,
                    }
                    : undefined,
                filteredLruIds.length > 0
                    ? {
                        label: t("standalone.selector.base-selector.lru-label"),
                        value: "lru-label",
                        isSmallLabel: true,
                    }
                    : undefined,
                ...(await Promise.all(filteredLruIds.map((id) => (async (id) => lru.loadData(id))(id).catch((e) => {
                    // remove IDs from LRU on backend error
                    if (e instanceof Error &&
                        (e.name === "BackendError" ||
                            e.name === "RequestBatchingError")) {
                        setLruIds((ids) => ids.filter((oId) => oId !== id));
                    }
                    return undefined;
                })))).filter((e) => !!e).map((entry) => ({
                    ...entry,
                    className: combineClassNames([
                        BaseSelectorLruOptionCssClassName,
                        entry.className,
                    ]),
                })),
            ].filter((entry) => entry);
        }
        else {
            results = [...(await onLoad(query, switchValue))];
            if (onAddNew) {
                if (results.length > 0) {
                    results.push({
                        label: "",
                        value: "lru-divider",
                        isDivider: true,
                    });
                }
                results.push(addNewEntry);
            }
        }
        // remove hidden
        results = results.filter((result) => !result.hidden);
        if (filterIds) {
            results = results.filter((entry) => !filterIds.includes(getId(entry)));
        }
        if (grouped && !disableGroupSorting) {
            results.sort(groupSorter ??
                ((a, b) => -(b.group ?? noGroupLabel ?? "").localeCompare(a.group ?? noGroupLabel ?? "")));
        }
        setLoading((prev) => {
            // if another load was started while completing this skip update
            if (prev != loadTicket)
                return prev;
            // otherwise update and finish loading
            setSelectorOptions(results);
            return null;
        });
    }, [
        actualAddNewLabel,
        filterIds,
        lruIds,
        lru,
        grouped,
        disableGroupSorting,
        onAddNew,
        t,
        setLruIds,
        onLoad,
        switchValue,
        getId,
        groupSorter,
        noGroupLabel,
    ]);
    const updateQuery = useCallback((_evt, newQuery) => {
        if (multiple && newQuery.length > 1) {
            newQuery = newQuery
                .substring(selected.map((sel) => sel.label).join(", ").length)
                .trimStart();
        }
        setQuery(newQuery);
    }, [multiple, selected]);
    // search handler
    useEffect(() => {
        if (!open)
            return;
        void onSearchHandler(query);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, switchValue]);
    // initial option load and reset options upon selection
    useEffect(() => {
        void onSearchHandler("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, switchValue, refreshToken]);
    // lru change
    useEffect(() => {
        if (query)
            return;
        void onSearchHandler("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lruIds.join(",")]);
    const filterOptions = useCallback((options) => options, []);
    return (React.createElement(StyledInlineSwitch, { visible: !!props.displaySwitch, value: switchValue, onChange: setSwitchValue, label: switchLabel, className: combineClassNames([className, classes?.inlineSwitch]) },
        React.createElement(BaseSelectorContext.Provider, { value: context },
            label && (React.createElement(StyledLabel, { shrink: true, disableAnimation: true, disabled: disabled, className: classes?.label, required: !!required, error: !!error }, label)),
            React.createElement(Wrapper, { elevation: 0, className: classes?.wrapper },
                React.createElement(StyledAutocomplete, { id: autocompleteId, className: classes?.autocomplete, multiple: multiple, disableCloseOnSelect: multiple, open: open, onOpen: () => {
                        setOpen(true);
                    }, onClose: () => {
                        setOpen(false);
                    }, disableClearable: disableClearable, loading: !!loading, loadingText: loadingText ?? t("standalone.selector.base-selector.loading-text"), autoComplete: true, disabled: disabled, selectOnFocus: !disableSearch, options: (() => {
                        let options = [];
                        // add selected to selectorOptions if not present to suppress warnings
                        const selectedArr = multiple
                            ? selected
                            : selected
                                ? [selected]
                                : [];
                        // free solo option
                        if (freeSolo &&
                            query &&
                            !(selectorOptions.find((entry) => getStringLabel(entry) === query) ||
                                selectedArr.find((entry) => getStringLabel(entry) === query)))
                            options.push({
                                label: query,
                                value: query,
                                freeSolo: true,
                            });
                        options = options.concat(selectorOptions);
                        options = options.concat(selectedArr);
                        // unique array
                        options = options.filter((value, idx, arr) => arr.findIndex((v2) => v2.value === value.value) === idx);
                        return options;
                    })(), groupBy: grouped
                        ? (option) => option.group ?? noGroupLabel ?? ""
                        : undefined, PopperComponent: GrowPopper, filterOptions: filterOptions, value: selected, inputValue: query, blurOnSelect: !multiple, onInputChange: updateQuery, popupIcon: React.createElement(ExpandMore, null), autoSelect: freeSolo, freeSolo: freeSolo, noOptionsText: lru && query === ""
                        ? (startTypingToSearchText ??
                            t("standalone.selector.base-selector.start-typing-to-search-text"))
                        : (noOptionsText ??
                            t("standalone.selector.base-selector.no-options-text")), openText: openText ?? t("standalone.selector.base-selector.open-icon-text"), closeText: closeText ??
                        t("standalone.selector.base-selector.close-icon-text"), clearText: clearText ??
                        t("standalone.selector.base-selector.clear-icon-text"), getOptionLabel: getStringLabel, renderOption: defaultRenderer, getOptionDisabled: getOptionDisabled, isOptionEqualToValue: getOptionSelected, onChange: (_event, selectedValue) => onChangeHandler(selectedValue), renderInput: (params) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { InputProps, InputLabelProps, ...otherParams } = params;
                        return (React.createElement(TextFieldWithHelp, { variant: variant ?? "outlined", ...otherParams, classes: textFieldClasses, inputProps: {
                                ...params.inputProps,
                                readOnly: disableSearch,
                                title: selected && !multiple
                                    ? (selected.titleTooltip ?? getStringLabel(selected))
                                    : undefined,
                                value: multiple
                                    ? [
                                        selected.map((sel) => sel.label).join(", "),
                                        params.inputProps.value,
                                    ].join(" ")
                                    : params.inputProps.value,
                            }, InputProps: {
                                ...InputProps,
                                classes: textFieldInputClasses,
                                readOnly: disableSearch,
                                startAdornment: (enableIcons && !multiple
                                    ? renderIcon(selected?.icon)
                                    : undefined) ?? startAdornment,
                                endAdornment: (() => {
                                    const hasAdditionalElements = openInfo || endAdornment || endAdornmentLeft;
                                    const infoBtn = openInfo && (React.createElement(InfoButton, { onClick: openInfo, className: classes?.infoBtn },
                                        React.createElement(InfoIcon, { color: "disabled" })));
                                    return hasAdditionalElements ? (params.InputProps?.endAdornment ? (React.cloneElement(params.InputProps?.endAdornment, {}, endAdornmentLeft, ...(params.InputProps?.endAdornment).props.children, infoBtn, endAdornment)) : (React.createElement(InputAdornment, { position: "end" },
                                        endAdornmentLeft,
                                        infoBtn,
                                        endAdornment))) : (params.InputProps?.endAdornment);
                                })(),
                            }, placeholder: placeholder, onChange: (event) => {
                                void onSearchHandler(event.target.value);
                            }, required: required, error: error, warning: warning }));
                    }, key: `${refreshToken || "no-refresh-token"} ${onAddNew
                        ? `add-new${actualAddNewLabel || "no-add-new-label"}`
                        : "no-add-new"}` })))));
};
export default React.memo(BaseSelector);
