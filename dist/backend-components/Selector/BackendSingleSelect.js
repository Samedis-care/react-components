import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useThemeProps } from "@mui/material";
import { SingleSelect, } from "../../standalone";
import useCCTranslations from "../../utils/useCCTranslations";
import getSelectedLoadErrorLabel from "./getSelectedLoadErrorLabel";
import useDebouncedLoad from "./useDebouncedLoad";
const BackendSingleSelect = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcBackendSingleSelect",
    });
    const { model, modelFetch: modelFetchProp, modelToSelectorData, searchResultLimit, onSelect, selected, initialData, searchDebounceTime, sort, switchFilterName, lru, onLoadError, additionalOptions, disableRequestBatching, freeSolo, selectedFreeSolo, onSelectFreeSolo, ...otherProps } = props;
    const modelFetch = modelFetchProp ?? model;
    if (freeSolo && !onSelectFreeSolo)
        throw new Error("freeSolo enabled, but no onSelectFreeSolo callback");
    // the entry picked from the list last, shown for its id until the effect below
    // has taken it into the cache, so a pick does not show "Loading…" in between
    const [picked, setPicked] = useState(null);
    const [selectedCache, setSelectedCache] = useState(null);
    const { t } = useCCTranslations();
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
            options: await Promise.all(records.map((record) => Promise.resolve(modelToSelectorData(record)))),
            total: meta.filteredRows ?? meta.totalRows,
        };
    }, [model, searchResultLimit, sort, switchFilterName, modelToSelectorData]);
    const handleLoadLruRecord = useCallback(async (id) => {
        const [data] = await modelFetch.getCached(id, {
            batch: !disableRequestBatching,
            dontReportNotFoundInBatch: true,
        });
        return modelToSelectorData(data);
    }, [modelFetch, modelToSelectorData, disableRequestBatching]);
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
    // fetch missing data entries
    useEffect(() => {
        if (selected == null)
            return;
        if (selectedCache?.value === selected)
            return;
        // no need to fetch additional options
        const additionalOption = additionalOptions?.find((opt) => opt.value === selected);
        if (additionalOption) {
            setSelectedCache(additionalOption);
            return;
        }
        // if this comes from selection no need to fetch it either
        if (picked && picked.value === selected) {
            setSelectedCache(picked);
            setPicked(null);
        }
        // set when selected changes again or the field unmounts: what is loaded for this
        // id then is discarded, so it can neither replace the entry of the new id nor
        // drop it
        let discarded = false;
        void (async () => {
            let newCache = null;
            if (initialData) {
                // process initial data
                const selectedRecord = initialData.find((record) => record["id"] === selected);
                if (selectedRecord) {
                    newCache = await modelToSelectorData(selectedRecord);
                }
            }
            if (!newCache) {
                try {
                    const data = await modelFetch.getCached(selected, {
                        batch: !disableRequestBatching,
                    });
                    newCache = await modelToSelectorData(data[0]);
                }
                catch (e) {
                    if (discarded)
                        return;
                    const label = getSelectedLoadErrorLabel(selected, e, onLoadError, t);
                    // if we should drop the record...
                    if (!label) {
                        // unselect it
                        if (onSelect)
                            onSelect(null);
                        newCache = null;
                        return;
                    }
                    newCache = {
                        value: selected,
                        label,
                    };
                }
            }
            if (discarded)
                return;
            setSelectedCache((oldCache) => Object.assign({}, oldCache, newCache));
        })();
        return () => {
            discarded = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);
    // the entry of selected: the cached one only while it is this id's, else one that
    // is known without loading it (just picked, or an additionalOptions entry; the
    // effect above caches it), else null while it loads
    const selectedEntry = selected == null
        ? null
        : selectedCache?.value === selected
            ? selectedCache
            : picked?.value === selected
                ? picked
                : (additionalOptions?.find((opt) => opt.value === selected) ?? null);
    const debouncedLoad = useDebouncedLoad(handleLoad, searchDebounceTime ?? 500);
    return (_jsx(SingleSelect, { ...otherProps, freeSolo: freeSolo, onLoad: debouncedLoad, displaySwitch: !!switchFilterName, additionalOptions: additionalOptions, onSelect: handleSelect, selected: selectedFreeSolo
            ? { value: selectedFreeSolo, label: selectedFreeSolo, freeSolo: true }
            : selected != null
                ? (selectedEntry ?? {
                    value: selected,
                    label: t("backend-components.selector.loading"),
                })
                : null, lru: lruConfig }));
};
export default React.memo(BackendSingleSelect);
