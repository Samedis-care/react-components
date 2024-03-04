import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getStringLabel, SingleSelect, } from "../../standalone";
import debouncePromise from "../../utils/debouncePromise";
import useCCTranslations from "../../utils/useCCTranslations";
const BackendSingleSelect = (props) => {
    const { model, modelFetch: modelFetchProp, modelToSelectorData, searchResultLimit, onSelect, selected, initialData, searchDebounceTime, sort, lru, onLoadError, additionalOptions, disableRequestBatching, ...otherProps } = props;
    const modelFetch = modelFetchProp ?? model;
    const [selectedCache, setSelectedCache] = useState(null);
    const { t } = useCCTranslations();
    const handleLoad = useCallback(async (search) => {
        const data = await model.index({
            page: 1,
            rows: searchResultLimit ?? 25,
            sort: sort,
            quickFilter: search,
        });
        return [
            ...(additionalOptions ?? []).filter((x) => getStringLabel(x).toLowerCase().includes(search.toLowerCase())),
            ...(await Promise.all(data[0].map(modelToSelectorData))),
        ];
    }, [model, searchResultLimit, sort, additionalOptions, modelToSelectorData]);
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
        setSelectedCache(selected);
        if (onSelect) {
            onSelect(selected ? selected.value : null);
        }
    }, [onSelect]);
    // fetch missing data entries
    useEffect(() => {
        if (!selected)
            return;
        if (selectedCache?.value === selected)
            return;
        // no need to fetch additional options
        const additionalOption = additionalOptions?.find((opt) => opt.value === selected);
        if (additionalOption) {
            setSelectedCache(additionalOption);
            return;
        }
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
                    const err = e;
                    let errorMsg = err.message ?? t("backend-components.selector.loading-error");
                    if (onLoadError) {
                        const result = onLoadError(err);
                        // if we should drop the record...
                        if (!result) {
                            // unselect it
                            if (onSelect)
                                onSelect(null);
                            newCache = null;
                            return;
                        }
                        errorMsg = result;
                    }
                    newCache = {
                        value: selected,
                        label: errorMsg,
                    };
                }
            }
            setSelectedCache((oldCache) => Object.assign({}, oldCache, newCache));
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);
    const debouncedLoad = useMemo(() => debouncePromise(handleLoad, searchDebounceTime ?? 500), [handleLoad, searchDebounceTime]);
    return (React.createElement(SingleSelect, { ...otherProps, onLoad: debouncedLoad, onSelect: handleSelect, selected: selected
            ? selectedCache ?? {
                value: selected,
                label: t("backend-components.selector.loading"),
            }
            : null, lru: lruConfig }));
};
export default React.memo(BackendSingleSelect);
