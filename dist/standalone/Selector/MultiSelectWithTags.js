import React, { useCallback, useEffect, useState } from "react";
import { Box, styled, Typography, useThemeProps } from "@mui/material";
import SingleSelect from "../../standalone/Selector/SingleSelect";
import MultiSelectWithoutGroup from "./MultiSelectWithoutGroup";
import uniqueArray from "../../utils/uniqueArray";
import Loader from "../Loader";
import combineClassNames from "../../utils/combineClassNames";
const Root = styled("div", { name: "CcMultiSelectWithTags", slot: "root" })({
    position: "relative",
});
const LoadOverlay = styled("div", {
    name: "CcMultiSelectWithTags",
    slot: "loadOverlay",
})({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: "rgba(255,255,255,.3)",
    transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) 500ms",
});
const MultiSelectWithTags = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcMultiSelectWithTags",
    });
    const { title, searchInputLabel, selected, disabled, autocompleteId, enableIcons, noOptionsText, loadingText, openText, closeText, loadGroupEntries, loadGroupOptions, loadDataOptions, onChange, openInfo, getIdOfData, switchLabel, lruGroup, lruData, sortCompareFn, className, classes, } = props;
    const defaultSwitchValue = props.displaySwitch
        ? props.defaultSwitchValue ?? false
        : false;
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [switchValue, setSwitchValue] = useState(defaultSwitchValue);
    const [loadingGroupRecords, setLoadingGroupRecords] = useState(false);
    const getIdDefault = useCallback((data) => data.value, []);
    const getId = getIdOfData ?? getIdDefault;
    // set switch value if switch visibility is toggled
    useEffect(() => {
        setSwitchValue(defaultSwitchValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [!!props.displaySwitch]);
    // remove selected groups if an item has been unselected
    useEffect(() => {
        const selectedIds = selected.map(getId);
        setSelectedGroups((oldSelectedGroups) => oldSelectedGroups.filter((group) => !group.items.find((item) => !selectedIds.includes(item))));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);
    const handleGroupSelect = useCallback(async (selectedGroup) => {
        if (!selectedGroup || !onChange)
            return;
        try {
            setLoadingGroupRecords(true);
            const groupEntries = await loadGroupEntries(selectedGroup);
            const groupEntryIds = groupEntries.map(getId);
            const combinedArray = [...selected, ...groupEntries];
            setSelectedGroups((prevState) => [
                ...prevState,
                {
                    group: selectedGroup.value,
                    items: groupEntryIds,
                },
            ]);
            onChange(uniqueArray(combinedArray
                .map(getId)
                .map((value) => combinedArray.find((entry) => getId(entry) === value))));
        }
        finally {
            setLoadingGroupRecords(false);
        }
    }, [onChange, loadGroupEntries, getId, selected]);
    const loadGroupOptionsAndProcess = useCallback(async (query) => {
        const selectedGroupIds = selectedGroups.map((group) => group.group);
        return (await loadGroupOptions(query, switchValue)).filter((group) => !selectedGroupIds.includes(group.value));
    }, [loadGroupOptions, selectedGroups, switchValue]);
    return (React.createElement(Root, { className: combineClassNames([className, classes?.root]) },
        React.createElement(LoadOverlay, { className: classes?.loadOverlay, style: loadingGroupRecords
                ? { visibility: "visible", opacity: 1 }
                : { visibility: "hidden", opacity: 0 } },
            React.createElement(Loader, null)),
        React.createElement(Typography, { component: "label", variant: "caption", color: "textSecondary" }, title),
        React.createElement(SingleSelect, { autocompleteId: autocompleteId ? autocompleteId + "-group-select" : undefined, selected: null, onSelect: handleGroupSelect, refreshToken: selectedGroups.length.toString(), onLoad: loadGroupOptionsAndProcess, disabled: disabled || loadingGroupRecords, enableIcons: enableIcons, noOptionsText: noOptionsText, loadingText: loadingText, openText: openText, closeText: closeText, lru: lruGroup }),
        React.createElement(Box, { pt: 3 },
            React.createElement(MultiSelectWithoutGroup, { autocompleteId: autocompleteId, selected: selected, disabled: disabled, label: searchInputLabel, enableIcons: enableIcons, switchValue: switchValue, setSwitchValue: setSwitchValue, switchLabel: switchLabel, displaySwitch: props.displaySwitch, loadDataOptions: loadDataOptions, openInfo: openInfo, onSelect: onChange, getIdOfData: getId, noOptionsText: noOptionsText, loadingText: loadingText, lru: lruData, sortCompareFn: sortCompareFn }))));
};
export default React.memo(MultiSelectWithTags);
