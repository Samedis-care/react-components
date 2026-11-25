import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { useThemeProps } from "@mui/material";
import { MultiSelect, } from "../../standalone";
import useCCTranslations from "../../utils/useCCTranslations";
import getSelectedLoadErrorLabel from "./getSelectedLoadErrorLabel";
import useDebouncedLoad from "./useDebouncedLoad";
/**
 * Marks the "Loading…" entry listed for a selected id whose record is still loading. The
 * selector hands it back with the next change like any entry, but it is none: it is not
 * reported in `onSelect`'s `raw` and never replaces a loaded entry.
 */
const LOADING_PLACEHOLDER = Symbol("BackendMultiSelect loading placeholder");
const makeLoadingPlaceholder = (value, label) => {
    const placeholder = { value, label, [LOADING_PLACEHOLDER]: true };
    return placeholder;
};
const isLoadingPlaceholder = (entry) => LOADING_PLACEHOLDER in entry;
export const useSelectedCache = (props) => {
    const { model, disableRequestBatching, modelToSelectorData, onSelect, selected, initialData, onLoadError, additionalOptions, } = props;
    const modelFetch = props.modelFetch ?? model;
    const [selectedCache, setSelectedCache] = useState({});
    // the selection, entries and handler of the latest render: a drop by onLoadError
    // removes its ids from this selection, not from the one its lookup started with
    const latest = useRef({ selected, selectedCache, onSelect });
    latest.current = { selected, selectedCache, onSelect };
    // lookups that end after unmount neither report a drop nor fill the cache
    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    const { t } = useCCTranslations();
    const handleSelect = useCallback((selected) => {
        setSelectedCache((cache) => {
            const newCache = { ...cache };
            selected.forEach((entry) => {
                // a placeholder handed back keeps its id from being looked up twice, but
                // never replaces the entry that loaded meanwhile (a group pick reports late)
                if (isLoadingPlaceholder(entry) && entry.value in newCache)
                    return;
                newCache[entry.value] = entry;
            });
            return newCache;
        });
        if (onSelect) {
            onSelect(selected.map((entry) => entry.value), selected.filter((entry) => !isLoadingPlaceholder(entry)));
        }
    }, [onSelect]);
    // fetch missing data entries
    useEffect(() => {
        void (async () => {
            const newCache = {};
            if (initialData) {
                // process initial data
                await Promise.all(initialData
                    .filter((record) => !(record.id in selectedCache))
                    .map(async (record) => (newCache[record.id] =
                    await modelToSelectorData(record))));
            }
            // an additionalOptions entry is not a record: listed as it is, never looked up
            additionalOptions?.forEach((option) => {
                if (selected.includes(option.value) && !(option.value in selectedCache))
                    newCache[option.value] = option;
            });
            const isIdNotInCache = (value) => !(value in selectedCache) && !(value in newCache);
            await Promise.all(selected.filter(isIdNotInCache).map(async (value) => {
                try {
                    const data = await modelFetch.getCached(value, {
                        batch: !disableRequestBatching,
                    });
                    newCache[value] = await modelToSelectorData(data[0]);
                }
                catch (e) {
                    const label = getSelectedLoadErrorLabel(value, e, onLoadError, t);
                    // if we should drop the record return here and don't create a record in cache
                    if (!label) {
                        return;
                    }
                    newCache[value] = {
                        value,
                        label,
                    };
                }
            }));
            if (!mounted.current)
                return;
            // the ids onLoadError dropped leave the current selection, so a pick or removal
            // made while they loaded is kept; an id picked again meanwhile has an entry and stays
            const dropped = selected.filter(isIdNotInCache);
            const current = latest.current;
            const newSelection = current.selected.filter((id) => {
                if (!dropped.includes(id))
                    return true;
                const entry = current.selectedCache[id];
                return entry !== undefined && !isLoadingPlaceholder(entry);
            });
            if (current.onSelect && newSelection.length < current.selected.length) {
                // a second drop before the parent has rendered this one starts from it
                latest.current = { ...current, selected: newSelection };
                current.onSelect(newSelection, newSelection
                    .map((id) => newCache[id] ?? current.selectedCache[id])
                    .filter((entry) => entry !== undefined && !isLoadingPlaceholder(entry)));
            }
            setSelectedCache((oldCache) => Object.assign({}, oldCache, newCache));
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);
    // stable identity: a new array on every render makes the selector reset its search
    const selectedData = useMemo(() => selected.map((value) => selectedCache[value] ??
        makeLoadingPlaceholder(value, t("backend-components.selector.loading"))), [selected, selectedCache, t]);
    return {
        selected: selectedData,
        handleSelect,
    };
};
/**
 * Backend connected MultiSelect
 * @remarks Doesn't support custom data
 * @constructor
 */
const BackendMultiSelect = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcBackendMultiSelect",
    });
    const { model, disableRequestBatching, modelToSelectorData, searchResultLimit, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSelect, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selected: selectedIds, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initialData, searchDebounceTime, sort, switchFilterName, lru, ...otherProps } = props;
    const modelFetch = props.modelFetch ?? model;
    const { selected, handleSelect } = useSelectedCache(props);
    const handleLoad = useCallback(async (search, switchValue) => {
        const [records, meta] = await model.index({
            page: 1,
            rows: searchResultLimit ?? 25,
            quickFilter: search,
            sort: sort,
            additionalFilters: switchFilterName
                ? { [switchFilterName]: switchValue }
                : undefined,
        });
        return {
            options: await Promise.all(records.map((value) => Promise.resolve(modelToSelectorData(value)))),
            total: meta.filteredRows ?? meta.totalRows,
        };
    }, [model, modelToSelectorData, searchResultLimit, sort, switchFilterName]);
    const handleLoadLruRecord = useCallback(async (id) => {
        const [data] = await modelFetch.getCached(id, {
            batch: !disableRequestBatching,
            dontReportNotFoundInBatch: true,
        });
        return modelToSelectorData(data);
    }, [disableRequestBatching, modelFetch, modelToSelectorData]);
    const lruConfig = useMemo(() => lru
        ? {
            ...lru,
            loadData: handleLoadLruRecord,
        }
        : undefined, [lru, handleLoadLruRecord]);
    const debouncedLoad = useDebouncedLoad(handleLoad, searchDebounceTime ?? 500);
    return (_jsx(MultiSelect, { ...otherProps, onLoad: debouncedLoad, onSelect: handleSelect, selected: selected, ...(switchFilterName
            ? { displaySwitch: true, switchLabel: props.switchLabel }
            : { displaySwitch: false }), lru: lruConfig }));
};
export default React.memo(BackendMultiSelect);
