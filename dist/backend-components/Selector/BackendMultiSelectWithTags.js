import React, { useCallback, useMemo } from "react";
import { MultiSelectWithTags, } from "../../standalone";
import { useSelectedCache, } from "./BackendMultiSelect";
import { debouncePromise } from "../../utils";
/**
 * Backend connected MultiSelectWithTags
 * @remarks Doesn't support custom data
 * @constructor
 */
const BackendMultiSelectWithTags = (props) => {
    const { groupModel, convGroup, getGroupDataEntries, dataModel, convData, switchFilterNameData, switchFilterNameGroup, initialData, onChange, groupSearchDebounceTime, dataSearchDebounceTime, selected: selectedIds, dataSort, groupSort, lruGroup, lruData, ...selectorProps } = props;
    const { handleSelect, selected } = useSelectedCache({
        model: dataModel,
        modelToSelectorData: convData,
        initialData,
        onSelect: onChange,
        selected: selectedIds,
    });
    const loadGroupEntries = useCallback(async (data) => {
        return getGroupDataEntries(await groupModel.getCached(data.value));
    }, [getGroupDataEntries, groupModel]);
    const loadGroupOptions = useCallback(async (query, switchValue) => {
        const [records] = await groupModel.index({
            page: 1,
            quickFilter: query,
            sort: groupSort,
            additionalFilters: switchFilterNameGroup
                ? { [switchFilterNameGroup]: switchValue }
                : undefined,
        });
        return Promise.all(records.map(convGroup));
    }, [convGroup, groupModel, groupSort, switchFilterNameGroup]);
    const loadDataOptions = useCallback(async (query, switchValue) => {
        const [records] = await dataModel.index({
            page: 1,
            quickFilter: query,
            sort: dataSort,
            additionalFilters: switchFilterNameData
                ? { [switchFilterNameData]: switchValue }
                : undefined,
        });
        return Promise.all(records.map(convData));
    }, [convData, dataModel, dataSort, switchFilterNameData]);
    const handleLoadGroupRecord = useCallback(async (id) => {
        const [data] = await groupModel.getCached(id);
        return convGroup(data);
    }, [groupModel, convGroup]);
    const lruGroupConfig = useMemo(() => lruGroup
        ? {
            ...lruGroup,
            loadData: handleLoadGroupRecord,
        }
        : undefined, [lruGroup, handleLoadGroupRecord]);
    const handleLoadDataRecord = useCallback(async (id) => {
        const [data] = await dataModel.getCached(id);
        return convData(data);
    }, [dataModel, convData]);
    const lruDataConfig = useMemo(() => lruData
        ? {
            ...lruData,
            loadData: handleLoadDataRecord,
        }
        : undefined, [lruData, handleLoadDataRecord]);
    const debouncedGroupLoad = useMemo(() => debouncePromise(loadGroupOptions, groupSearchDebounceTime ?? 500), [groupSearchDebounceTime, loadGroupOptions]);
    const debouncedDataLoad = useMemo(() => debouncePromise(loadDataOptions, dataSearchDebounceTime ?? 500), [dataSearchDebounceTime, loadDataOptions]);
    return (React.createElement(MultiSelectWithTags, { ...selectorProps, onChange: handleSelect, selected: selected, loadGroupEntries: loadGroupEntries, loadDataOptions: debouncedDataLoad, loadGroupOptions: debouncedGroupLoad, displaySwitch: !!(switchFilterNameGroup || switchFilterNameData), lruGroup: lruGroupConfig, lruData: lruDataConfig }));
};
export default React.memo(BackendMultiSelectWithTags);
