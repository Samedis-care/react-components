import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Cancel as RemoveIcon, Search as SearchIcon, } from "@mui/icons-material";
import BaseSelector from "./BaseSelector";
import { SmallIconButton, SmallListItemIcon } from "../Small";
import InlineSwitch from "../InlineSwitch";
import { styled, Typography, useThemeProps } from "@mui/material";
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
});
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
const MultiSelectWithoutGroup = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcMultiSelectWithoutGroup",
    });
    const { onSelect, selected, disabled, enableIcons, loadDataOptions, getIdOfData, refreshToken, switchValue, sortCompareFn, classes, className, ...otherProps } = props;
    const [dataOptions, setDataOptions] = useState([]);
    const getIdDefault = useCallback((data) => data.value, []);
    const getId = getIdOfData ?? getIdDefault;
    const selectedIds = useMemo(() => selected.map(getId), [selected, getId]);
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
    const multiSelectHandler = useCallback((data) => {
        if (!data)
            return;
        const selectedOptions = [...selected, data];
        if (onSelect)
            onSelect(selectedOptions);
    }, [onSelect, selected]);
    const onLoad = useCallback(async (query) => {
        const results = await loadDataOptions(query, !!switchValue);
        return results.map((result) => selectedIds.includes(getId(result))
            ? { ...result, isDisabled: true, selected: true }
            : result);
    }, [getId, loadDataOptions, selectedIds, switchValue]);
    return (React.createElement(Typography, { component: "div", className: className },
        React.createElement(BaseSelector, { ...otherProps, onLoad: onLoad, selected: null, onSelect: multiSelectHandler, refreshToken: (refreshToken ?? "") +
                selectedIds.join(",") +
                (switchValue ?? false).toString(), variant: "standard", startAdornment: React.createElement(SearchIcon, { color: "primary" }), freeSolo: true, displaySwitch: false, filterIds: selected.map(getId) }),
        React.createElement(StyledInlineSwitch, { visible: !!props.displaySwitch, value: !!switchValue, onChange: props.setSwitchValue, label: props.switchLabel, className: classes?.switch },
            React.createElement(React.Fragment, null, (sortCompareFn ? selected.sort(sortCompareFn) : selected).map((data, index) => {
                return (React.createElement(Outlined, { key: index, className: classes?.outlined },
                    enableIcons && (React.createElement(SmallListItemIcon, null, data.icon)),
                    React.createElement("span", null, data.label),
                    !disabled && (React.createElement(SmallIconButton, { edge: "end", name: data.value, disabled: disabled, onClick: handleDelete },
                        React.createElement(RemoveIcon, null)))));
            })))));
};
export default React.memo(MultiSelectWithoutGroup);
