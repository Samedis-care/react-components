import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { useThemeProps } from "@mui/material";
import { MultiSelect, } from "../../standalone";
import useCCTranslations from "../../utils/useCCTranslations";
import getSelectedLoadErrorLabel from "./getSelectedLoadErrorLabel";
import getSelectedLoadKey from "./getSelectedLoadKey";
import { isSelectedLoadErrorEntry, makeSelectedLoadErrorEntry, } from "./selectedLoadErrorEntry";
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
    const { model, disableRequestBatching, modelToSelectorData, onSelect, selected, initialData, onLoadError, additionalOptions, refreshToken, } = props;
    const modelFetch = props.modelFetch ?? model;
    const loadKey = getSelectedLoadKey(modelFetch, !disableRequestBatching, refreshToken);
    const [selectedCache, setSelectedCache] = useState({});
    // the ids onLoadError dropped: not listed while they are selected without an entry,
    // also when the selection is not updated (no onSelect, or a parent that keeps them)
    const [droppedIds, setDroppedIds] = useState(() => new Set());
    // the record of each id this field listed, loaded or converted, by id: a new
    // modelToSelectorData converts the listed entries again from them, without a request
    const recordsById = useRef(new Map());
    // what each entry in the cache was made with; "Loading…" placeholders have no origin
    const origins = useRef(new WeakMap());
    // counts the lookups that listed an entry made with props that changed while it
    // loaded: the effect below then makes it again
    const [revision, setRevision] = useState(0);
    // the selection and load key the effect below last ran for: ids without an entry are
    // looked up for a new selection or load key; when only modelToSelectorData (or the
    // revision) changed, they are loading already or onLoadError dropped them
    const lastRun = useRef(null);
    // the selection, entries, handler and props of the latest render: a drop by
    // onLoadError removes its ids from this selection, not from the one its lookup
    // started with
    const latest = useRef({
        selected,
        selectedCache,
        onSelect,
        additionalOptions,
        modelToSelectorData,
        loadKey,
    });
    latest.current = {
        selected,
        selectedCache,
        onSelect,
        additionalOptions,
        modelToSelectorData,
        loadKey,
    };
    // whether an entry was made with the current modelToSelectorData and load key, as far
    // as they concern it (an entry without origin is a placeholder: it is being loaded)
    const isCurrent = useCallback((entry) => {
        const origin = origins.current.get(entry);
        return (!origin ||
            ((origin.convertedBy === null ||
                origin.convertedBy === latest.current.modelToSelectorData) &&
                (origin.loadKey === null || origin.loadKey === latest.current.loadKey)));
    }, []);
    // lookups that end after unmount neither report a drop nor fill the cache
    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    const { t } = useCCTranslations();
    const convert = useCallback(async (record) => {
        const entry = await modelToSelectorData(record);
        recordsById.current.set(entry.value, record);
        return entry;
    }, [modelToSelectorData]);
    const handleSelect = useCallback((selected) => {
        // a picked entry is made with the current props: one from the list was converted
        // from a record listed here, an additionalOptions entry is never loaded
        selected.forEach((entry) => {
            if (isLoadingPlaceholder(entry) || origins.current.has(entry))
                return;
            const { additionalOptions, modelToSelectorData, loadKey } = latest.current;
            const isOption = !!additionalOptions?.some((option) => option.value === entry.value);
            origins.current.set(entry, {
                convertedBy: !isOption && recordsById.current.has(entry.value)
                    ? modelToSelectorData
                    : null,
                loadKey: isOption ? null : loadKey,
            });
        });
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
    // fetch missing data entries, convert the entries made with another
    // modelToSelectorData again and load those made with another load key again
    useEffect(() => {
        const loadMissing = lastRun.current?.selected !== selected ||
            lastRun.current.loadKey !== loadKey;
        lastRun.current = { selected, loadKey };
        void (async () => {
            const newCache = {};
            // an additionalOptions entry is not a record: listed as it is, never looked up
            additionalOptions?.forEach((option) => {
                if (selected.includes(option.value) &&
                    !(option.value in selectedCache)) {
                    origins.current.set(option, { convertedBy: null, loadKey: null });
                    newCache[option.value] = option;
                }
            });
            const isIdNotInCache = (value) => !(value in selectedCache) && !(value in newCache);
            const missing = loadMissing ? selected.filter(isIdNotInCache) : [];
            // listed entries made with props that changed since
            const outdated = selected.filter((value) => value in selectedCache && !isCurrent(selectedCache[value]));
            // the ids among them whose record cannot be loaded again and onLoadError dropped
            const droppedListed = [];
            const lookUp = async (value) => (await modelFetch.getCached(value, {
                batch: !disableRequestBatching,
            }))[0];
            const convertSelected = async (value, record) => {
                const entry = await modelToSelectorData(record);
                recordsById.current.set(value, record);
                origins.current.set(entry, {
                    convertedBy: modelToSelectorData,
                    loadKey,
                });
                return entry;
            };
            // the entry of an id whose record failed to load, or null to drop the id
            const failedEntry = (value, e) => {
                const label = getSelectedLoadErrorLabel(value, e, onLoadError, t);
                if (!label)
                    return null;
                const entry = makeSelectedLoadErrorEntry(value, label);
                origins.current.set(entry, { convertedBy: null, loadKey });
                return entry;
            };
            await Promise.all([
                ...missing.map(async (value) => {
                    try {
                        // an id with an initialData record is converted from it, any other loaded;
                        // a conversion that fails is a failed load either way
                        const record = initialData?.find((record) => record.id === value) ?? (await lookUp(value));
                        newCache[value] = await convertSelected(value, record);
                    }
                    catch (e) {
                        const entry = failedEntry(value, e);
                        // if we should drop the record return here and don't create a record in cache
                        if (entry)
                            newCache[value] = entry;
                    }
                }),
                ...outdated.map(async (value) => {
                    const origin = origins.current.get(selectedCache[value]);
                    const reload = origin?.loadKey != null && origin.loadKey !== loadKey;
                    try {
                        // converted again from its record, unless it is loaded again
                        const record = (!reload && recordsById.current.get(value)) ||
                            (await lookUp(value));
                        newCache[value] = await convertSelected(value, record);
                    }
                    catch (e) {
                        const entry = failedEntry(value, e);
                        if (entry)
                            newCache[value] = entry;
                        else
                            droppedListed.push(value);
                    }
                }),
            ]);
            if (!mounted.current)
                return;
            // the ids onLoadError dropped leave the current selection, so a pick or removal
            // made while they loaded is kept; an id picked again meanwhile has a new entry and
            // stays
            const dropped = [...missing.filter(isIdNotInCache), ...droppedListed];
            const current = latest.current;
            const newSelection = current.selected.filter((id) => {
                if (!dropped.includes(id))
                    return true;
                const entry = current.selectedCache[id];
                return (entry !== undefined &&
                    !isLoadingPlaceholder(entry) &&
                    entry !== selectedCache[id]);
            });
            if (current.onSelect && newSelection.length < current.selected.length) {
                // a second drop before the parent has rendered this one starts from it
                latest.current = { ...current, selected: newSelection };
                current.onSelect(newSelection, newSelection
                    .map((id) => newCache[id] ?? current.selectedCache[id])
                    .filter((entry) => entry !== undefined && !isLoadingPlaceholder(entry)));
            }
            // the entries the dropped ids had when their lookup started
            const droppedEntries = droppedListed.map((id) => [id, selectedCache[id]]);
            setSelectedCache((oldCache) => {
                const nextCache = {
                    ...oldCache,
                };
                Object.entries(newCache).forEach(([id, entry]) => {
                    // an entry made with props that changed while it loaded does not replace
                    // one made with the current props (it does replace "Loading…")
                    const old = nextCache[id];
                    if (old &&
                        !isLoadingPlaceholder(old) &&
                        isCurrent(old) &&
                        !isCurrent(entry))
                        return;
                    nextCache[id] = entry;
                });
                // a dropped entry is no longer listed, unless it was picked again meanwhile
                droppedEntries.forEach(([id, entry]) => {
                    if (nextCache[id] === entry)
                        delete nextCache[id];
                });
                return nextCache;
            });
            if (dropped.length > 0)
                setDroppedIds((oldDropped) => new Set([...oldDropped, ...dropped]));
            // an entry made with props that changed while it loaded is made again
            if (Object.values(newCache).some((entry) => !isCurrent(entry)))
                setRevision((oldRevision) => oldRevision + 1);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, modelToSelectorData, loadKey, revision]);
    // stable identity: a new array on every render makes the selector reset its search
    const selectedData = useMemo(() => selected
        // an id onLoadError dropped is left out until it has an entry: a pick from
        // the list, or a later lookup that loads or labels it
        .filter((value) => {
        if (!droppedIds.has(value))
            return true;
        const entry = selectedCache[value];
        return entry !== undefined && !isLoadingPlaceholder(entry);
    })
        .map((value) => selectedCache[value] ??
        makeLoadingPlaceholder(value, t("backend-components.selector.loading"))), [selected, selectedCache, droppedIds, t]);
    return {
        selected: selectedData,
        handleSelect,
        loadError: selectedData.some(isSelectedLoadErrorEntry),
        convert,
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
    const { model, disableRequestBatching, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    modelToSelectorData, searchResultLimit, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSelect, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selected: selectedIds, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initialData, searchDebounceTime, sort, switchFilterName, lru, error, ...otherProps } = props;
    const modelFetch = props.modelFetch ?? model;
    const { selected, handleSelect, loadError, convert } = useSelectedCache(props);
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
            options: await Promise.all(records.map(convert)),
            total: meta.filteredRows ?? meta.totalRows,
        };
    }, [model, convert, searchResultLimit, sort, switchFilterName]);
    const handleLoadLruRecord = useCallback(async (id) => {
        const [data] = await modelFetch.getCached(id, {
            batch: !disableRequestBatching,
            dontReportNotFoundInBatch: true,
        });
        return convert(data);
    }, [disableRequestBatching, modelFetch, convert]);
    const lruConfig = useMemo(() => lru
        ? {
            ...lru,
            loadData: handleLoadLruRecord,
        }
        : undefined, [lru, handleLoadLruRecord]);
    const debouncedLoad = useDebouncedLoad(handleLoad, searchDebounceTime ?? 500);
    return (_jsx(MultiSelect, { ...otherProps, error: error || loadError, onLoad: debouncedLoad, onSelect: handleSelect, selected: selected, ...(switchFilterName
            ? { displaySwitch: true, switchLabel: props.switchLabel }
            : { displaySwitch: false }), lru: lruConfig }));
};
export default React.memo(BackendMultiSelect);
