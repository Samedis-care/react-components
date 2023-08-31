import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MultiSelect, } from "../../standalone";
import { debouncePromise } from "../../utils";
import useCCTranslations from "../../utils/useCCTranslations";
export const useSelectedCache = (props) => {
    const { model, modelToSelectorData, onSelect, selected, initialData, onLoadError, } = props;
    const [selectedCache, setSelectedCache] = useState({});
    const { t } = useCCTranslations();
    const handleSelect = useCallback((selected) => {
        setSelectedCache((cache) => {
            const newCache = { ...cache };
            selected.forEach((entry) => (newCache[entry.value] = entry));
            return newCache;
        });
        if (onSelect) {
            onSelect(selected.map((entry) => entry.value), selected);
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
                    .map(async (record) => (newCache[record.id] = await modelToSelectorData(record))));
            }
            const isIdNotInCache = (value) => !(value in selectedCache) && !(value in newCache);
            await Promise.all(selected.filter(isIdNotInCache).map(async (value) => {
                try {
                    const data = await model.getCached(value);
                    newCache[value] = await modelToSelectorData(data[0]);
                }
                catch (e) {
                    const err = e;
                    let errorMsg = err.message ?? t("backend-components.selector.loading-error");
                    if (onLoadError) {
                        const result = onLoadError(err);
                        // if we should drop the record return here and don't create a record in cache
                        if (!result) {
                            return;
                        }
                        errorMsg = result;
                    }
                    newCache[value] = {
                        value,
                        label: errorMsg,
                    };
                }
            }));
            // now that everything has loaded ensure we actually drop records
            // if we can update and we have something to drop
            if (onSelect && selected.filter(isIdNotInCache).length > 0) {
                // call onSelect with new array
                const newSelection = selected.filter((id) => !isIdNotInCache(id));
                onSelect(newSelection, newSelection.map((id) => selectedCache[id] ?? newCache[id]));
            }
            setSelectedCache((oldCache) => Object.assign({}, oldCache, newCache));
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);
    return {
        selected: selected.map((value) => selectedCache[value] ?? {
            value,
            label: t("backend-components.selector.loading"),
        }),
        handleSelect,
    };
};
/**
 * Backend connected MultiSelect
 * @remarks Doesn't support custom data
 * @constructor
 */
const BackendMultiSelect = (props) => {
    const { model, modelToSelectorData, searchResultLimit, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSelect, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selected: selectedIds, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initialData, searchDebounceTime, sort, switchFilterName, lru, ...otherProps } = props;
    const { selected, handleSelect } = useSelectedCache(props);
    const handleLoad = useCallback(async (search, switchValue) => {
        const data = await model.index({
            page: 1,
            rows: searchResultLimit ?? 25,
            quickFilter: search,
            sort: sort,
            additionalFilters: switchFilterName
                ? { [switchFilterName]: switchValue }
                : undefined,
        });
        return Promise.all(data[0].map(modelToSelectorData));
    }, [model, modelToSelectorData, searchResultLimit, sort, switchFilterName]);
    const handleLoadRecord = useCallback(async (id) => {
        const [data] = await model.getCached(id);
        return modelToSelectorData(data);
    }, [model, modelToSelectorData]);
    const lruConfig = useMemo(() => lru
        ? {
            ...lru,
            loadData: handleLoadRecord,
        }
        : undefined, [lru, handleLoadRecord]);
    const debouncedLoad = useMemo(() => debouncePromise(handleLoad, searchDebounceTime ?? 500), [searchDebounceTime, handleLoad]);
    return (React.createElement(MultiSelect, { ...otherProps, onLoad: debouncedLoad, onSelect: handleSelect, selected: selected, displaySwitch: !!switchFilterName, lru: lruConfig }));
};
export default React.memo(BackendMultiSelect);
