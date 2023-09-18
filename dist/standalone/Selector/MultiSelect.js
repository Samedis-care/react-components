import React, { useCallback, useContext, useMemo } from "react";
import BaseSelector from "./BaseSelector";
import { Grid, Paper, useTheme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import MultiSelectEntry from "./MultiSelectEntry";
import { cleanClassMap, combineClassMaps } from "../../utils";
import { showConfirmDialogBool } from "../../non-standalone";
import { DialogContext } from "../../framework";
import useCCTranslations from "../../utils/useCCTranslations";
const useBaseSelectorStyles = makeStyles((theme) => ({
    inputRoot: (props) => ({
        borderRadius: props.selected.length > 0
            ? `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0px 0px`
            : undefined,
    }),
}), { name: "CcMultiSelectBase" });
const useMultiSelectorStyles = makeStyles((theme) => ({
    selectedEntries: {
        border: `1px solid rgba(0, 0, 0, 0.23)`,
        borderTop: 0,
        borderRadius: `0px 0px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    },
}), { name: "CcMultiSelect" });
const MultiSelect = (props) => {
    const { onLoad, onSelect, selected, enableIcons, selectedEntryRenderer, disabled, getIdOfData, displaySwitch, switchLabel, defaultSwitchValue, selectedSort, } = props;
    const theme = useTheme();
    const { t } = useCCTranslations();
    const confirmDelete = props.confirmDelete ??
        theme.componentsCare?.multiSelect?.confirmDeleteDefault ??
        false;
    const multiSelectClasses = useMultiSelectorStyles(props);
    const baseSelectorClasses = useBaseSelectorStyles(cleanClassMap(props, true));
    const getIdDefault = useCallback((data) => data.value, []);
    const getId = getIdOfData ?? getIdDefault;
    const selectedIds = useMemo(() => selected.map(getId), [getId, selected]);
    const EntryRender = selectedEntryRenderer || MultiSelectEntry;
    const multiSelectHandler = useCallback((data) => {
        if (!data)
            return;
        const selectedOptions = [...selected, data];
        if (onSelect)
            onSelect(selectedOptions);
    }, [onSelect, selected]);
    const multiSelectLoadHandler = useCallback(async (query, switchValue) => {
        const results = await onLoad(query, switchValue);
        return results.map((result) => selectedIds.includes(getId(result))
            ? { ...result, isDisabled: true, selected: true }
            : result);
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
    return (React.createElement(Grid, { container: true },
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(BaseSelector, { ...props, classes: combineClassMaps(baseSelectorClasses, props.subClasses?.baseSelector), onLoad: multiSelectLoadHandler, selected: null, onSelect: multiSelectHandler, refreshToken: selectedIds.join(","), displaySwitch: displaySwitch, switchLabel: switchLabel, defaultSwitchValue: defaultSwitchValue, filterIds: selectedIds })),
        props.selected.length > 0 && (React.createElement(Grid, { item: true, xs: 12, className: multiSelectClasses.selectedEntries },
            React.createElement(Paper, { elevation: 0 }, (selectedSort
                ? props.selected.sort(selectedSort)
                : props.selected).map((data, index) => (React.createElement(EntryRender, { key: getId(data) || index.toString(16), enableDivider: props.selected.length === index - 1, enableIcons: enableIcons, handleDelete: disabled || data.noDelete ? undefined : handleDelete, data: data, setData: handleSetData, iconSize: props.iconSize }))))))));
};
export default React.memo(MultiSelect);
