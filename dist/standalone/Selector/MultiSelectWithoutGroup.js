import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Cancel as RemoveIcon, RestoreFromTrash as RestoreIcon, Search as SearchIcon, } from "@mui/icons-material";
import BaseSelector from "./BaseSelector";
import { SmallIconButton, SmallListItemIcon } from "../Small";
import InlineSwitch from "../InlineSwitch";
import { Chip, styled, Typography, useThemeProps } from "@mui/material";
import useCCTranslations from "../../utils/useCCTranslations";
import combineClassNames from "../../utils/combineClassNames";
const Outlined = styled("div", {
    name: "CcMultiSelectWithoutGroup",
    slot: "outlined",
})({
    float: "left",
    backgroundColor: "#cce1f6",
    padding: "0px 20px",
    borderRadius: 20,
    borderColor: "#cce1f6",
    margin: "5px",
    lineHeight: "30px",
    // the label of a removed entry
    "&.CcMultiSelectWithoutGroup-removed > span": {
        textDecoration: "line-through",
    },
});
// the text of a change that is not saved yet, after the label
const ChangeState = styled(Chip, {
    name: "CcMultiSelectWithoutGroup",
    slot: "changeState",
})(({ theme }) => ({
    marginInlineStart: 8,
    // on the paper rather than the chip's tint, where the text has its contrast
    backgroundColor: theme.palette.background.paper,
}));
const StyledInlineSwitch = styled(InlineSwitch, {
    name: "CcMultiSelectWithoutGroup",
    slot: "switch",
})({
    marginTop: 0,
    "& .CcInlineSwitch-switchWrapper": {
        lineHeight: "30px",
        width: "100%",
        direction: "rtl",
    },
});
const NO_ENTRIES = [];
const MultiSelectWithoutGroup = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcMultiSelectWithoutGroup",
    });
    const { onSelect, selected, added, removed: removedProp, disabled, enableIcons, loadDataOptions, getIdOfData, refreshToken, switchValue, sortCompareFn, classes, className, filterIds, ...otherProps } = props;
    const { t } = useCCTranslations();
    const [dataOptions, setDataOptions] = useState([]);
    const getIdDefault = useCallback((data) => data.value, []);
    const getId = getIdOfData ?? getIdDefault;
    const removed = removedProp ?? NO_ENTRIES;
    const selectedIds = useMemo(() => selected.map(getId), [selected, getId]);
    const removedIds = useMemo(() => removed.map(getId), [removed, getId]);
    // the selected entries are filtered out of the options on top of whatever the caller
    // wants filtered, and so are the removed ones: they come back through their restore button
    const combinedFilterIds = useMemo(() => [...(filterIds ?? []), ...selectedIds, ...removedIds], [filterIds, selectedIds, removedIds]);
    const listed = useMemo(() => {
        const entries = [
            ...selected.map((data) => ({
                data,
                changeState: added?.includes(data.value)
                    ? "added"
                    : undefined,
            })),
            ...removed.map((data) => ({ data, changeState: "removed" })),
        ];
        return sortCompareFn
            ? entries.sort((a, b) => sortCompareFn(a.data, b.data))
            : entries;
    }, [added, removed, selected, sortCompareFn]);
    useEffect(() => {
        selected.map((selectedOption) => {
            setDataOptions((oldOptions) => oldOptions.filter((option) => !getId(option).includes(getId(selectedOption))));
        });
    }, [getId, selected]);
    const handleDelete = useCallback(async (evt) => {
        evt.stopPropagation();
        if (!onSelect)
            return;
        // find the item
        const entryToDelete = selected.find((s) => s.value === evt.currentTarget.name);
        if (!entryToDelete) {
            throw new Error("[Components-Care] [MultiSelectWithoutGroups] Entry couldn't be found. entry.value is not set");
        }
        // check that we can delete the item
        if (entryToDelete.canUnselect &&
            !(await entryToDelete.canUnselect(entryToDelete, evt))) {
            return;
        }
        setDataOptions([...dataOptions, entryToDelete]);
        onSelect(selected.filter((entry) => entry !== entryToDelete));
    }, [onSelect, setDataOptions, dataOptions, selected]);
    const handleRestore = useCallback((evt) => {
        evt.stopPropagation();
        const entry = removed.find((s) => s.value === evt.currentTarget.name);
        if (!entry || !onSelect)
            return;
        onSelect([...selected, entry]);
    }, [onSelect, removed, selected]);
    const multiSelectHandler = useCallback((data) => {
        if (!data)
            return;
        const selectedOptions = [...selected, data];
        if (onSelect)
            onSelect(selectedOptions);
    }, [onSelect, selected]);
    const onLoad = useCallback(async (query) => {
        const result = await loadDataOptions(query, !!switchValue);
        return {
            ...result,
            options: result.options.map((entry) => {
                const id = getId(entry);
                if (selectedIds.includes(id))
                    return { ...entry, isDisabled: true, selected: true };
                // a removed entry comes back through its restore button; hidden here by this
                // field's ids, as the search field compares filterIds by value
                if (removedIds.includes(id))
                    return { ...entry, hidden: true };
                return entry;
            }),
        };
    }, [getId, loadDataOptions, removedIds, selectedIds, switchValue]);
    return (_jsxs(Typography, { component: "div", className: className, children: [_jsx(BaseSelector, { ...otherProps, onLoad: onLoad, disabled: disabled, selected: null, onSelect: multiSelectHandler, refreshToken: (refreshToken ?? "") +
                    selectedIds.join(",") +
                    (switchValue ?? false).toString(), variant: "standard", startAdornment: _jsx(SearchIcon, { color: disabled ? "disabled" : "primary" }), freeSolo: true, displaySwitch: false, filterIds: combinedFilterIds }), _jsx(StyledInlineSwitch, { visible: !!props.displaySwitch, value: !!switchValue, onChange: props.setSwitchValue, label: props.switchLabel, disabled: disabled, className: classes?.switch, children: _jsx(_Fragment, { children: listed.map(({ data, changeState }, index) => {
                        // a removed entry is restored where it would be removed
                        const restorable = changeState === "removed";
                        return (_jsxs(Outlined, { className: combineClassNames([
                                classes?.outlined,
                                changeState && `CcMultiSelectWithoutGroup-${changeState}`,
                            ]), children: [enableIcons && (_jsx(SmallListItemIcon, { children: data.icon })), _jsx("span", { children: data.label }), changeState && (_jsx(ChangeState, { size: "small", variant: "outlined", color: changeState === "added" ? "success" : "default", label: t(`standalone.selector.multi-select.change.${changeState}`), className: classes?.changeState })), !disabled && (_jsx(SmallIconButton, { edge: "end", name: data.value, disabled: disabled, onClick: restorable ? handleRestore : handleDelete, "aria-label": t(restorable
                                        ? "standalone.selector.multi-select.restore-item"
                                        : "standalone.selector.multi-select.remove-item", { ITEM: data.label }), children: restorable ? _jsx(RestoreIcon, {}) : _jsx(RemoveIcon, {}) }))] }, index));
                    }) }) })] }));
};
export default React.memo(MultiSelectWithoutGroup);
