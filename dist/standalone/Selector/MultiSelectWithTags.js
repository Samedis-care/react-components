import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, } from "react";
import { Box, styled, Typography, useThemeProps } from "@mui/material";
import SingleSelect from "../../standalone/Selector/SingleSelect";
import MultiSelectWithoutGroup from "./MultiSelectWithoutGroup";
import uniqueArray from "../../utils/uniqueArray";
import Loader from "../Loader";
import combineClassNames from "../../utils/combineClassNames";
import { labelWithDirtyMarker } from "../UIKit/MuiFieldState";
import useCCTranslations from "../../utils/useCCTranslations";
const Root = styled("div", { name: "CcMultiSelectWithTags", slot: "root" })({
    position: "relative",
});
const GroupInputLabel = styled("label", {
    name: "CcMultiSelectWithTags",
    slot: "groupInputLabel",
})({
    // visually hidden, as MUI's visuallyHidden
    border: 0,
    clipPath: "inset(50%)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
    width: 1,
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
    const { title, dirty, autoFocus, searchInputLabel, groupInputLabel, selected, disabled, autocompleteId, enableIcons, noOptionsText, loadingText, openText, closeText, forceQuery, startTypingToSearchText, loadGroupEntries, loadGroupOptions, loadDataOptions, onChange, openInfo, getIdOfData, switchLabel, lruGroup, lruData, sortCompareFn, className, classes, filterIds, } = props;
    const { t } = useCCTranslations();
    const id = useId();
    const titleId = `${id}-title`;
    const groupFieldId = `${autocompleteId || id}-group-select`;
    const defaultSwitchValue = props.displaySwitch
        ? (props.defaultSwitchValue ?? false)
        : false;
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [switchValue, setSwitchValue] = useState(defaultSwitchValue);
    const [loadingGroupRecords, setLoadingGroupRecords] = useState(false);
    const getIdDefault = useCallback((data) => data.value, []);
    const getId = getIdOfData ?? getIdDefault;
    const rootRef = useRef(null);
    /** pointerType of the last press in the control, null after a key press */
    const lastPointerTypeRef = useRef(null);
    /** the group field gets focus back after a group pick, see handleGroupSelect */
    const keepGroupFocusRef = useRef(false);
    const getGroupInput = useCallback(() => rootRef.current?.ownerDocument.getElementById(groupFieldId) ?? null, [groupFieldId]);
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
        // the pick blurs the group field, and the reload after the load replaces it, so
        // it gets focus back; not after a touch, whose blur closes the on-screen keyboard
        const groupInput = getGroupInput();
        keepGroupFocusRef.current =
            lastPointerTypeRef.current !== "touch" &&
                !!groupInput &&
                groupInput === groupInput.ownerDocument.activeElement;
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
    }, [onChange, loadGroupEntries, getId, selected, getGroupInput]);
    // gives focus back to the group field after a group pick, but only from the page:
    // focus the user moved elsewhere during the load stays there
    useLayoutEffect(() => {
        if (!keepGroupFocusRef.current)
            return;
        const groupInput = getGroupInput();
        const active = groupInput?.ownerDocument.activeElement;
        if (groupInput && (!active || active === groupInput.ownerDocument.body))
            groupInput.focus();
        if (!loadingGroupRecords)
            keepGroupFocusRef.current = false;
    });
    const handleKeyDownCapture = useCallback((evt) => {
        lastPointerTypeRef.current = null;
        // the group field is read-only while a group loads: no key opens its list or picks
        if (loadingGroupRecords && evt.target === getGroupInput())
            evt.stopPropagation();
    }, [loadingGroupRecords, getGroupInput]);
    const handlePointerDownCapture = useCallback((evt) => {
        lastPointerTypeRef.current = evt.pointerType;
    }, []);
    const loadGroupOptionsAndProcess = useCallback(async (query) => {
        const selectedGroupIds = selectedGroups.map((group) => group.group);
        const result = await loadGroupOptions(query, switchValue);
        const options = result.options.filter((group) => !selectedGroupIds.includes(group.value));
        return {
            options,
            // total has to count the same population as options, otherwise dropping the
            // already selected groups would report a truncation which isn't there
            total: result.total != null
                ? result.total - (result.options.length - options.length)
                : undefined,
        };
    }, [loadGroupOptions, selectedGroups, switchValue]);
    return (_jsxs(Root, { ref: rootRef, className: combineClassNames([className, classes?.root]), role: "group", "aria-labelledby": titleId, "aria-busy": loadingGroupRecords, onKeyDownCapture: handleKeyDownCapture, onPointerDownCapture: handlePointerDownCapture, children: [_jsx(LoadOverlay, { className: classes?.loadOverlay, style: loadingGroupRecords
                    ? { visibility: "visible", opacity: 1 }
                    : { visibility: "hidden", opacity: 0 }, children: _jsx(Loader, {}) }), _jsx(Typography, { id: titleId, variant: "caption", color: "textSecondary", children: labelWithDirtyMarker(title, dirty) }), _jsx(GroupInputLabel, { id: `${groupFieldId}-label`, htmlFor: groupFieldId, className: classes?.groupInputLabel, children: groupInputLabel ||
                    t("standalone.selector.multi-select-with-tags.group-input-label") }), _jsx(SingleSelect, { autocompleteId: groupFieldId, selected: null, onSelect: handleGroupSelect, refreshToken: selectedGroups.length.toString(), onLoad: loadGroupOptionsAndProcess, disabled: disabled, disableSearch: loadingGroupRecords, enableIcons: enableIcons, noOptionsText: noOptionsText, loadingText: loadingText, openText: openText, closeText: closeText, forceQuery: forceQuery, startTypingToSearchText: startTypingToSearchText, lru: lruGroup, autoFocus: autoFocus }), _jsx(Box, { sx: { pt: 3 }, children: _jsx(MultiSelectWithoutGroup, { autocompleteId: autocompleteId, selected: selected, disabled: disabled, label: searchInputLabel, enableIcons: enableIcons, switchValue: switchValue, setSwitchValue: setSwitchValue, switchLabel: switchLabel, displaySwitch: props.displaySwitch, loadDataOptions: loadDataOptions, openInfo: openInfo, onSelect: onChange, getIdOfData: getId, noOptionsText: noOptionsText, loadingText: loadingText, forceQuery: forceQuery, startTypingToSearchText: startTypingToSearchText, lru: lruData, sortCompareFn: sortCompareFn, filterIds: filterIds }) })] }));
};
export default React.memo(MultiSelectWithTags);
