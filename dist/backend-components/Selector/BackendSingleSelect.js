import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { useThemeProps } from "@mui/material";
import { SingleSelect, } from "../../standalone";
import useCCTranslations from "../../utils/useCCTranslations";
import getSelectedLoadErrorLabel from "./getSelectedLoadErrorLabel";
import getSelectedLoadKey from "./getSelectedLoadKey";
import { isSelectedLoadErrorEntry, makeSelectedLoadErrorEntry, } from "./selectedLoadErrorEntry";
import useDebouncedLoad from "./useDebouncedLoad";
const BackendSingleSelect = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcBackendSingleSelect",
    });
    const { model, modelFetch: modelFetchProp, modelToSelectorData, searchResultLimit, onSelect, selected, initialData, searchDebounceTime, sort, switchFilterName, lru, onLoadError, additionalOptions, disableRequestBatching, freeSolo, selectedFreeSolo, onSelectFreeSolo, error, refreshToken, ...otherProps } = props;
    const modelFetch = modelFetchProp ?? model;
    const loadKey = getSelectedLoadKey(modelFetch, !disableRequestBatching, refreshToken);
    if (freeSolo && !onSelectFreeSolo)
        throw new Error("freeSolo enabled, but no onSelectFreeSolo callback");
    // the entry picked from the list last, shown for its id until the effect below
    // has taken it into the cache, so a pick does not show "Loading…" in between
    const [picked, setPicked] = useState(null);
    const [selectedCache, setSelectedCache] = useState(null);
    // the record of each id this field listed, loaded or converted, by id: a new
    // modelToSelectorData converts the shown entry again from it, without a request
    const recordsById = useRef(new Map());
    // the id and load key the effect below last ran for: an id onLoadError dropped is
    // looked up again for a new id or load key, not for a new modelToSelectorData
    const lastRun = useRef(null);
    // the ids onLoadError dropped: while one is selected without an entry, the field is
    // empty, also when the parent keeps it (no onSelect, or one that does not apply null)
    const [droppedIds, setDroppedIds] = useState(() => new Set());
    const { t } = useCCTranslations();
    // converts a record for the list (an option, an LRU entry) and keeps the record, so a
    // pick of its entry can be converted again
    const convert = useCallback(async (record) => {
        const entry = await modelToSelectorData(record);
        recordsById.current.set(entry.value, record);
        return entry;
    }, [modelToSelectorData]);
    const handleLoad = useCallback(async (search, switchValue) => {
        const [records, meta] = await model.index({
            page: 1,
            rows: searchResultLimit ?? 25,
            sort: sort,
            quickFilter: search,
            additionalFilters: switchFilterName
                ? { [switchFilterName]: switchValue }
                : undefined,
        });
        return {
            options: await Promise.all(records.map(convert)),
            total: meta.filteredRows ?? meta.totalRows,
        };
    }, [model, searchResultLimit, sort, switchFilterName, convert]);
    const handleLoadLruRecord = useCallback(async (id) => {
        const [data] = await modelFetch.getCached(id, {
            batch: !disableRequestBatching,
            dontReportNotFoundInBatch: true,
        });
        return convert(data);
    }, [modelFetch, convert, disableRequestBatching]);
    const lruConfig = useMemo(() => lru
        ? {
            ...lru,
            loadData: handleLoadLruRecord,
        }
        : undefined, [lru, handleLoadLruRecord]);
    const handleSelect = useCallback((selected) => {
        if (selected && selected.freeSolo) {
            // free solo
            if (onSelectFreeSolo)
                onSelectFreeSolo(selected.value);
            return;
        }
        setPicked(selected);
        if (onSelect) {
            onSelect(selected ? selected.value : null);
        }
    }, [onSelect, onSelectFreeSolo]);
    // the entry of selected: taken or loaded once per id, converted again by a new
    // modelToSelectorData and loaded again for a new load key
    useEffect(() => {
        const retryDropped = lastRun.current?.selected !== selected ||
            lastRun.current.loadKey !== loadKey;
        lastRun.current = { selected, loadKey };
        if (selected == null)
            return;
        const cached = selectedCache?.entry.value === selected ? selectedCache : null;
        // a modelFetch with other keys or a new refreshToken loads the shown entry again,
        // unless it is an additionalOptions entry
        const reload = cached !== null && cached.loadKey !== null && cached.loadKey !== loadKey;
        if (cached) {
            // a new modelToSelectorData converts it again, if it was converted from a record
            const reconvert = cached.convertedBy !== null &&
                cached.convertedBy !== modelToSelectorData;
            if (!reload && !reconvert)
                return;
        }
        else {
            // no need to fetch additional options
            const additionalOption = additionalOptions?.find((opt) => opt.value === selected);
            if (additionalOption) {
                setSelectedCache({
                    entry: additionalOption,
                    convertedBy: null,
                    loadKey: null,
                });
                return;
            }
            // a pick from the list (or the entry onAddNew created) is shown as picked, without
            // looking it up again; one from the list was converted from a record listed here
            if (picked && picked.value === selected) {
                setSelectedCache({
                    entry: picked,
                    convertedBy: recordsById.current.has(selected)
                        ? modelToSelectorData
                        : null,
                    loadKey,
                });
                setPicked(null);
                return;
            }
            if (droppedIds.has(selected) && !retryDropped)
                return;
        }
        // set when selected, modelToSelectorData or the load key change again, or the field
        // unmounts: what is loaded for this id then is discarded, so it can neither replace
        // the entry of the new id or a newer one of this id, nor drop it
        let discarded = false;
        void (async () => {
            let record;
            let newEntry = null;
            if (cached) {
                // converted again from its record, unless it is loaded again
                if (!reload)
                    record = recordsById.current.get(selected);
            }
            else if (initialData) {
                // process initial data
                record = initialData.find((record) => record["id"] === selected);
                if (record) {
                    newEntry = await modelToSelectorData(record);
                }
            }
            if (!newEntry || !record) {
                try {
                    record ??= (await modelFetch.getCached(selected, {
                        batch: !disableRequestBatching,
                    }))[0];
                    newEntry = await modelToSelectorData(record);
                }
                catch (e) {
                    if (discarded)
                        return;
                    const label = getSelectedLoadErrorLabel(selected, e, onLoadError, t);
                    // if we should drop the record...
                    if (!label) {
                        // unselect it, and stop showing the entry it had
                        setDroppedIds((oldDropped) => new Set(oldDropped).add(selected));
                        if (cached)
                            setSelectedCache(null);
                        if (onSelect)
                            onSelect(null);
                        return;
                    }
                    setSelectedCache({
                        entry: makeSelectedLoadErrorEntry(selected, label),
                        convertedBy: null,
                        loadKey,
                    });
                    return;
                }
            }
            if (discarded)
                return;
            recordsById.current.set(selected, record);
            // the entry of the new id replaces the previous one: a field the new entry
            // leaves out (titleTooltip, icon, …) must not keep the previous record's value
            setSelectedCache({
                entry: newEntry,
                convertedBy: modelToSelectorData,
                loadKey,
            });
        })();
        return () => {
            discarded = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, modelToSelectorData, loadKey]);
    // the entry of selected: the cached one only while it is this id's, else one that
    // is known without loading it (just picked, or an additionalOptions entry; the
    // effect above caches it), else null while it loads (shown as "Loading…") or after
    // onLoadError dropped it (shown as an empty field)
    const selectedEntry = selected == null
        ? null
        : selectedCache?.entry.value === selected
            ? selectedCache.entry
            : picked?.value === selected
                ? picked
                : (additionalOptions?.find((opt) => opt.value === selected) ?? null);
    // the entry of a record that failed to load names no record: the field is in error
    // while it is shown
    const loadError = !selectedFreeSolo &&
        selectedEntry != null &&
        isSelectedLoadErrorEntry(selectedEntry);
    const debouncedLoad = useDebouncedLoad(handleLoad, searchDebounceTime ?? 500);
    return (_jsx(SingleSelect, { ...otherProps, error: error || loadError, freeSolo: freeSolo, onLoad: debouncedLoad, ...(switchFilterName
            ? { displaySwitch: true, switchLabel: props.switchLabel }
            : { displaySwitch: false }), additionalOptions: additionalOptions, refreshToken: refreshToken, onSelect: handleSelect, selected: selectedFreeSolo
            ? { value: selectedFreeSolo, label: selectedFreeSolo, freeSolo: true }
            : selected != null && !droppedIds.has(selected)
                ? (selectedEntry ?? {
                    value: selected,
                    label: t("backend-components.selector.loading"),
                })
                : selectedEntry, lru: lruConfig }));
};
export default React.memo(BackendSingleSelect);
