import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { useThemeProps } from "@mui/material";
import { useSelectedCache, } from "./BackendMultiSelect";
import BaseSelector from "../../standalone/Selector/BaseSelector";
import useDebouncedLoad from "./useDebouncedLoad";
/**
 * Backend connected BaseSelector with multiple=true
 * @constructor
 */
const BackendMultipleSelect = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcBackendMultipleSelect",
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
    return (_jsx(BaseSelector, { multiple: true, ...otherProps, error: error || loadError, onLoad: debouncedLoad, onSelect: handleSelect, selected: selected, ...(switchFilterName
            ? { displaySwitch: true, switchLabel: props.switchLabel }
            : { displaySwitch: false }), lru: lruConfig }));
};
export default React.memo(BackendMultipleSelect);
