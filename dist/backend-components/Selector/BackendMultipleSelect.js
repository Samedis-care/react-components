import React, { useCallback, useMemo } from "react";
import debouncePromise from "../../utils/debouncePromise";
import { useSelectedCache, } from "./BackendMultiSelect";
import BaseSelector from "../../standalone/Selector/BaseSelector";
/**
 * Backend connected BaseSelector with multiple=true
 * @constructor
 */
const BackendMultipleSelect = (props) => {
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
    const debouncedLoad = useMemo(() => debouncePromise(handleLoad, searchDebounceTime ?? 500), [searchDebounceTime, handleLoad]);
    return (React.createElement(BaseSelector, { multiple: true, ...otherProps, onLoad: debouncedLoad, onSelect: handleSelect, selected: selected, displaySwitch: !!switchFilterName, lru: lruConfig }));
};
export default React.memo(BackendMultipleSelect);
