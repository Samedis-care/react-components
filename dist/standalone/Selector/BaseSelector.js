import React, { useState, useCallback, useEffect, useMemo, } from "react";
import { ListItemText, IconButton, Paper, Divider, Typography, Popper, Grid, Autocomplete, InputLabel, } from "@mui/material";
import { Add as AddIcon, ExpandMore, Info as InfoIcon, } from "@mui/icons-material";
import TextFieldWithHelp from "../UIKit/TextFieldWithHelp";
import { cleanClassMap, combineClassNames, SelectorSmallListItemButton, SmallListItemIcon, useLocalStorageState, } from "../..";
import { makeThemeStyles } from "../../utils";
import { makeStyles } from "@mui/styles";
import InlineSwitch from "../InlineSwitch";
import useCCTranslations from "../../utils/useCCTranslations";
import uniqueArray from "../../utils/uniqueArray";
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
const useCustomDefaultSelectorStyles = makeStyles({
    root: {},
    focused: {},
    tag: {},
    tagSizeSmall: {},
    inputRoot: {},
    input: {},
    inputFocused: {},
    endAdornment: {},
    clearIndicator: {},
    clearIndicatorDirty: {},
    popupIndicator: {},
    popupIndicatorOpen: {},
    popper: {},
    popperDisablePortal: {},
    paper: {},
    listbox: {},
    loading: {},
    noOptions: {},
    groupLabel: {},
    groupUl: {},
    option: {
        padding: 0,
        '&[aria-disabled="true"]': {
            opacity: 1,
        },
    },
}, { name: "CcBaseSelectorBase" });
const useThemeStyles = makeThemeStyles((theme) => theme.componentsCare?.uiKit?.baseSelectorExpert?.base, "CcBaseSelector", useCustomDefaultSelectorStyles);
const useCustomStylesBase = makeStyles((theme) => ({
    infoBtn: {
        padding: 2,
        marginRight: -2,
    },
    textFieldStandard: {
        position: "absolute",
    },
    label: {
        position: "relative",
        transform: "translate(0,0) scale(0.75)",
        zIndex: "unset",
    },
    switch: {
        marginTop: -30,
    },
    labelWithSwitch: {
        marginTop: 0,
    },
    icon: (props) => ({
        width: props.iconSize ?? 32,
        height: props.iconSize ?? 32,
        objectFit: "contain",
    }),
    wrapper: {},
    listItem: {
        paddingLeft: "16px !important",
        paddingRight: "16px !important",
        paddingTop: 6,
        paddingBottom: 6,
    },
    lruListItem: {
        backgroundColor: theme.palette.background.default,
        "&:hover": {
            backgroundColor: theme.palette.background.paper,
        },
    },
    smallLabel: {
        paddingLeft: 16,
        paddingTop: 4,
        color: theme.palette.text.disabled,
    },
    selected: {
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.secondary.main,
        padding: `calc(${theme.spacing(1)} / 2) ${theme.spacing(1)}`,
    },
    divider: {
        width: "100%",
    },
}), { name: "CcBaseSelectorCustomBase" });
const useCustomStyles = makeThemeStyles((theme) => theme.componentsCare?.uiKit?.baseSelectorExpert?.extensions, "CcBaseSelectorCustom", useCustomStylesBase);
const getOptionDisabled = (option) => !!(!option || option.isDisabled || option.isDivider || option.isSmallLabel);
const getOptionSelected = (option, value) => option.value === value.value;
const GrowPopper = React.forwardRef(function GrowPopperImpl(props, ref) {
    return (React.createElement(Popper, { ...props, ref: ref, style: { ...props.style, width: "unset", minWidth: props.style?.width } }));
});
export const BaseSelectorContext = React.createContext(null);
const BaseSelector = (props) => {
    const { variant, refreshToken, onSelect, selected, label, disabled, disableSearch, placeholder, autocompleteId, addNewLabel, onLoad, onAddNew, enableIcons, noOptionsText, loadingText, startTypingToSearchText, openText, closeText, clearText, disableClearable, openInfo, grouped, noGroupLabel, disableGroupSorting, groupSorter, switchLabel, lru, startAdornment, endAdornment, endAdornmentLeft, freeSolo, getIdOfData, filterIds, textFieldClasses, textFieldInputClasses, } = props;
    const getIdDefault = useCallback((data) => data.value, []);
    const getId = getIdOfData ?? getIdDefault;
    const classes = useThemeStyles(props);
    const defaultSwitchValue = !!(props.displaySwitch && props.defaultSwitchValue);
    const [switchValue, setSwitchValue] = useState(defaultSwitchValue);
    const { t } = useCCTranslations();
    const customClasses = useCustomStyles(cleanClassMap(props, true));
    const [open, setOpen] = useState(false);
    const actualAddNewLabel = addNewLabel || t("standalone.selector.add-new");
    const [selectorOptions, setSelectorOptions] = useState([]);
    const [loading, setLoading] = useState(null);
    const [query, setQuery] = useState("");
    const [lruIds, setLruIds] = useLocalStorageState(lru?.storageKey, [], (ret) => Array.isArray(ret) &&
        !ret.find((entry) => typeof entry !== "string"));
    const renderIcon = useCallback((icon) => typeof icon === "string" ? (React.createElement("img", { src: icon, alt: "", className: customClasses.icon })) : (icon), [customClasses.icon]);
    const defaultRenderer = useCallback((props, data) => {
        if (data.isDivider)
            return (React.createElement(Divider, { component: "li", ...props, className: customClasses.divider }));
        if (data.isSmallLabel)
            return (React.createElement(Typography, { component: "li", ...props, onClick: undefined, variant: "caption", className: customClasses.smallLabel }, getReactLabel(data)));
        return (React.createElement(SelectorSmallListItemButton, { component: "li", ...props, className: combineClassNames([
                customClasses.listItem,
                data.className,
                props.className,
            ]), disabled: data.isDisabled },
            enableIcons && (React.createElement(SmallListItemIcon, null, renderIcon(data.icon))),
            React.createElement(ListItemText, null,
                React.createElement(Grid, { container: true },
                    React.createElement(Grid, { item: true, xs: true }, getReactLabel(data)),
                    data.selected && (React.createElement(Grid, { item: true, className: customClasses.selected }, t("standalone.selector.base-selector.selected")))))));
    }, [
        customClasses.divider,
        customClasses.smallLabel,
        customClasses.listItem,
        customClasses.selected,
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
        if (!data || typeof data !== "object" || !("value" in data)) {
            if (data) {
                // eslint-disable-next-line no-console
                console.warn("[Components-Care] [BaseSelector] Unexpected value passed to handleOptionSelect:", data);
                return;
            }
        }
        if (data &&
            "isAddNewButton" in data &&
            data.isAddNewButton) {
            if (!onAddNew)
                return;
            const created = await onAddNew();
            if (!created)
                return;
            setSelectorOptions((old) => [created, ...old]);
            data = created;
        }
        if (onSelect) {
            onSelect(data);
            if (data != null) {
                addToLru(getId(data));
            }
        }
    }, [onSelect, onAddNew, addToLru, getId]);
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
                        customClasses.lruListItem,
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
        customClasses.lruListItem,
        onLoad,
        switchValue,
        getId,
        groupSorter,
        noGroupLabel,
    ]);
    const updateQuery = useCallback((_, newQuery) => {
        setQuery(newQuery);
    }, []);
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
    return (React.createElement(InlineSwitch, { visible: !!props.displaySwitch, value: switchValue, onChange: setSwitchValue, label: switchLabel, classes: customClasses },
        React.createElement(BaseSelectorContext.Provider, { value: context },
            label && (React.createElement(InputLabel, { shrink: true, disableAnimation: true, disabled: disabled, className: customClasses.label }, label)),
            React.createElement(Paper, { elevation: 0, className: customClasses.wrapper },
                React.createElement(Autocomplete, { id: autocompleteId, classes: classes, open: open, onOpen: () => {
                        setOpen(true);
                    }, onClose: () => {
                        setOpen(false);
                    }, disableClearable: disableClearable, loading: !!loading, loadingText: loadingText ?? t("standalone.selector.base-selector.loading-text"), autoComplete: true, disabled: disabled, selectOnFocus: !disableSearch, options: 
                    // add selected to selectorOptions if not present to suppress warnings
                    selected &&
                        !selectorOptions.find((option) => option.value === selected.value)
                        ? selectorOptions.concat([selected])
                        : selectorOptions, groupBy: grouped
                        ? (option) => option.group ?? noGroupLabel ?? ""
                        : undefined, PopperComponent: GrowPopper, filterOptions: filterOptions, value: selected, inputValue: query, blurOnSelect: true, onInputChange: updateQuery, popupIcon: React.createElement(ExpandMore, null), freeSolo: freeSolo, noOptionsText: lru && query === ""
                        ? startTypingToSearchText ??
                            t("standalone.selector.base-selector.start-typing-to-search-text")
                        : noOptionsText ??
                            t("standalone.selector.base-selector.no-options-text"), openText: openText ?? t("standalone.selector.base-selector.open-icon-text"), closeText: closeText ??
                        t("standalone.selector.base-selector.close-icon-text"), clearText: clearText ??
                        t("standalone.selector.base-selector.clear-icon-text"), getOptionLabel: getStringLabel, renderOption: defaultRenderer, getOptionDisabled: getOptionDisabled, isOptionEqualToValue: getOptionSelected, onChange: (_event, selectedValue) => onChangeHandler(selectedValue), renderInput: (params) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { InputProps, InputLabelProps, ...otherParams } = params;
                        return (React.createElement(TextFieldWithHelp, { variant: variant ?? "outlined", ...otherParams, classes: textFieldClasses, inputProps: {
                                ...params.inputProps,
                                readOnly: disableSearch,
                                title: selected ? getStringLabel(selected) : undefined,
                            }, InputProps: {
                                ...InputProps,
                                classes: textFieldInputClasses,
                                readOnly: disableSearch,
                                startAdornment: (enableIcons ? renderIcon(selected?.icon) : undefined) ??
                                    startAdornment,
                                endAdornment: (() => {
                                    const hasAdditionalElements = openInfo || endAdornment || endAdornmentLeft;
                                    return hasAdditionalElements
                                        ? React.cloneElement(params.InputProps?.endAdornment, {}, endAdornmentLeft, ...(params.InputProps?.endAdornment).props.children, openInfo && (React.createElement(IconButton, { onClick: openInfo, className: customClasses.infoBtn },
                                            React.createElement(InfoIcon, { color: "disabled" }))), endAdornment)
                                        : params.InputProps?.endAdornment;
                                })(),
                            }, placeholder: placeholder, onChange: (event) => {
                                void onSearchHandler(event.target.value);
                            } }));
                    }, key: `${refreshToken || "no-refresh-token"} ${onAddNew
                        ? `add-new${actualAddNewLabel || "no-add-new-label"}`
                        : "no-add-new"}` })))));
};
export default React.memo(BaseSelector);
