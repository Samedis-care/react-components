import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useContext, useId, useMemo } from "react";
import BaseSelector from "./BaseSelector";
import { Grid, InputLabel, List, Paper, styled, Typography, useThemeProps, } from "@mui/material";
import MultiSelectEntry from "./MultiSelectEntry";
import { showConfirmDialogBool } from "../../non-standalone/Dialog/Utils";
import { DialogContext } from "../../framework/DialogContextProvider";
import useCCTranslations from "../../utils/useCCTranslations";
import combineClassNames from "../../utils/combineClassNames";
import { withMuiFieldState } from "../UIKit/MuiFieldState";
const Root = styled(Grid, {
    name: "CcMultiSelect",
    slot: "root",
})({});
const SelectedEntry = styled(Grid, {
    name: "CcMultiSelect",
    slot: "selectedEntry",
})(({ theme }) => ({
    border: `1px solid rgba(0, 0, 0, 0.23)`,
    borderTop: 0,
    borderRadius: `0px 0px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    // read-only: no search field above, so the box is closed on all sides
    "&.CcMultiSelect-readOnly": {
        borderTop: `1px solid rgba(0, 0, 0, 0.23)`,
        borderRadius: theme.shape.borderRadius,
    },
}));
// a span: it names the list, there is no control to label
const SpanLabel = (props) => (_jsx(InputLabel, { component: "span", ...props }));
// the read-only selector's label, drawn as BaseSelector draws the label of its field
const ReadOnlyLabel = withMuiFieldState(styled(SpanLabel, {
    name: "CcMultiSelect",
    slot: "label",
})({
    position: "relative",
    transform: "translate(0,0) scale(0.75)",
    zIndex: "unset",
}));
// "No entries" of an empty read-only selector, where an entry's text would be
const EmptyText = styled(Typography, {
    name: "CcMultiSelect",
    slot: "empty",
})(({ theme }) => ({
    padding: "12px 8px",
    color: theme.palette.text.secondary,
}));
const StyledBaseSelector = styled(BaseSelector, {
    name: "CcMultiSelect",
    slot: "selector",
})(({ theme, ownerState: { selected } }) => ({
    "& .MuiAutocomplete-inputRoot": {
        borderRadius: selected
            ? `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0px 0px`
            : undefined,
    },
})); // tradeoff: remove ownerState from type config, but keep generics
const MultiSelect = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMultiSelect" });
    const { onLoad, onSelect, selected, enableIcons, selectedEntryRenderer, disabled, readOnly, label, error, dirty, getIdOfData, displaySwitch, switchLabel, defaultSwitchValue, selectedSort, confirmDelete, className, classes, filterIds, refreshToken, } = props;
    const { t } = useCCTranslations();
    const labelId = useId();
    const getIdDefault = useCallback((data) => data.value, []);
    const getId = getIdOfData ?? getIdDefault;
    const selectedIds = useMemo(() => selected.map(getId), [getId, selected]);
    // the selected entries are filtered out of the options on top of whatever the caller wants filtered
    const combinedFilterIds = useMemo(() => [...(filterIds ?? []), ...selectedIds], [filterIds, selectedIds]);
    const EntryRender = selectedEntryRenderer || MultiSelectEntry;
    const multiSelectHandler = useCallback((data) => {
        if (!data)
            return;
        const selectedOptions = [...selected, data];
        if (onSelect)
            onSelect(selectedOptions);
    }, [onSelect, selected]);
    const multiSelectLoadHandler = useCallback(async (query, switchValue) => {
        const result = await onLoad(query, switchValue);
        return {
            ...result,
            options: result.options.map((entry) => selectedIds.includes(getId(entry))
                ? { ...entry, isDisabled: true, selected: true }
                : entry),
        };
    }, [getId, onLoad, selectedIds]);
    const dialogContext = useContext(DialogContext); // this is standalone, so this has to be optional. framework might not be present.
    if (confirmDelete && !dialogContext) {
        throw new Error("[Components-Care] You enabled MultiSelect.confirmDelete, but no DialogContext can be found.");
    }
    const genericDeleteConfirm = useCallback(async (evt) => {
        if (evt.shiftKey)
            return true;
        if (!dialogContext)
            return true;
        const [pushDialog] = dialogContext;
        return showConfirmDialogBool(pushDialog, {
            title: t("standalone.selector.multi-select.delete-confirm.title"),
            message: t("standalone.selector.multi-select.delete-confirm.message"),
            textButtonYes: t("standalone.selector.multi-select.delete-confirm.yes"),
            textButtonNo: t("standalone.selector.multi-select.delete-confirm.no"),
        });
    }, [dialogContext, t]);
    const handleDelete = useCallback((evt) => {
        evt.stopPropagation(); // don't trigger onClick event on item itself
        let canDelete = true;
        const entry = selected.find((s) => s.value === evt.currentTarget.name);
        if (!entry) {
            throw new Error("[Components-Care] [MultiSelect] Entry couldn't be found. Either entry.value is not set, or the entity renderer does not correctly set the name attribute");
        }
        void (async () => {
            if (entry.canUnselect) {
                canDelete = await entry.canUnselect(entry, evt);
            }
            else if (confirmDelete) {
                canDelete = await genericDeleteConfirm(evt);
            }
            if (canDelete && onSelect) {
                const selectedOptions = selected.filter((s) => s.value !== entry.value);
                onSelect(selectedOptions);
            }
        })();
    }, [onSelect, selected, genericDeleteConfirm, confirmDelete]);
    const handleSetData = useCallback((newValue) => {
        if (!onSelect)
            return;
        onSelect(selected.map((entry) => getId(entry) === getId(newValue) ? newValue : entry));
    }, [getId, onSelect, selected]);
    const entries = props.selected.length > 0 && (_jsx(List, { disablePadding: true, "aria-labelledby": readOnly && label ? labelId : undefined, children: (selectedSort
            ? [...props.selected].sort(selectedSort)
            : props.selected).map((data, index) => (_jsx(EntryRender, { enableDivider: props.selected.length === index - 1, enableIcons: enableIcons, handleDelete: disabled || readOnly || data.noDelete ? undefined : handleDelete, data: data, setData: handleSetData, iconSize: props.iconSize }, getId(data) || index.toString(16)))) }));
    if (readOnly) {
        return (_jsxs(Root, { size: "grow", container: true, className: combineClassNames([className, classes?.root]), children: [label && (_jsx(Grid, { size: 12, children: _jsx(ReadOnlyLabel, { id: labelId, shrink: true, disableAnimation: true, error: !!error, dirty: dirty, className: classes?.label, children: label }) })), _jsx(SelectedEntry, { size: 12, className: combineClassNames([
                        classes?.selectedEntry,
                        "CcMultiSelect-readOnly",
                    ]), children: _jsx(Paper, { elevation: 0, children: entries || (_jsx(EmptyText, { className: classes?.empty, children: t("standalone.selector.multi-select.no-entries") })) }) })] }));
    }
    return (_jsxs(Root, { size: "grow", container: true, className: combineClassNames([className, classes?.root]), children: [_jsx(Grid, { size: 12, children: _jsx(StyledBaseSelector, { ...props, 
                    // @ts-expect-error removed owner state from props to preserve generics
                    ownerState: { selected: selected.length > 0 }, className: classes?.selector, onLoad: multiSelectLoadHandler, selected: null, onSelect: multiSelectHandler, refreshToken: (refreshToken ?? "") + selectedIds.join(","), displaySwitch: displaySwitch, switchLabel: switchLabel, defaultSwitchValue: defaultSwitchValue, filterIds: combinedFilterIds }) }), entries && (_jsx(SelectedEntry, { size: 12, className: classes?.selectedEntry, children: _jsx(Paper, { elevation: 0, children: entries }) }))] }));
};
export default React.memo(MultiSelect);
