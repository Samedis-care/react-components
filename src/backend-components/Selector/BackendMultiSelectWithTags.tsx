import React, { useCallback, useMemo } from "react";
import {
	BaseSelectorData,
	MultiSelectorData,
	MultiSelectWithTags,
	MultiSelectWithTagsProps,
	SelectorLruOptions,
} from "../../standalone";
import {
	Model,
	ModelFieldName,
	ModelGetResponse,
	PageVisibility,
} from "../../backend-integration";
import {
	BackendMultiSelectLruOptions,
	useSelectedCache,
} from "./BackendMultiSelect";
import { debouncePromise } from "../../utils";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";
import { BackendSingleSelectLruOptions } from "./BackendSingleSelect";

export interface BackendMultiSelectWithTagsProps<
	GroupKeyT extends ModelFieldName,
	DataKeyT extends ModelFieldName,
	GroupVisibilityT extends PageVisibility,
	DataVisibilityT extends PageVisibility,
	GroupCustomT,
	DataCustomT,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData,
> extends Omit<
		MultiSelectWithTagsProps<DataDataT, GroupDataT>,
		| "loadGroupEntries"
		| "loadDataOptions"
		| "loadGroupOptions"
		| "displaySwitch"
		| "selected"
		| "onChange"
		| "lruGroup"
		| "lruData"
	> {
	/**
	 * The selected data record IDs
	 */
	selected: string[];
	/**
	 * Change event callback
	 * @param selected The now selected IDs
	 */
	onChange?: (selected: string[], raw: DataDataT[]) => void;
	/**
	 * Initial data (model format) used for selected cache
	 */
	initialData?: Record<DataKeyT, unknown>[];
	/**
	 * The data source for groups
	 */
	groupModel: Model<GroupKeyT, GroupVisibilityT, GroupCustomT>;
	/**
	 * Callback that converts a model entry to a base selector entry
	 * @param data The record data (overview)
	 * @returns Selector data
	 * @remarks Selector data value must be set to ID
	 */
	convGroup: (
		data: Record<string, unknown>,
	) => Promise<GroupDataT> | GroupDataT;
	/**
	 * Callback that gets the group entries for a given group record
	 * @param data The record data (detailed)
	 * @returns Data selector entries
	 * @remarks Selector data value must be set to ID of data record
	 */
	getGroupDataEntries: (
		data: ModelGetResponse<GroupKeyT>,
	) => Promise<DataDataT[]> | DataDataT[];
	/**
	 * The data source for data entries
	 */
	dataModel: Model<DataKeyT, DataVisibilityT, DataCustomT>;
	/**
	 * Callback that converts a model entry to a multi selector entry
	 * @param data The record data (overview)
	 * @returns Selector data
	 * @remarks Selector data value must be set to ID
	 */
	convData: (data: Record<string, unknown>) => Promise<DataDataT> | DataDataT;
	/**
	 * Name of the switch filter for groups or undefined if disabled
	 */
	switchFilterNameGroup?: string;
	/**
	 * Name of the switch filter for data or undefined if disabled
	 */
	switchFilterNameData?: string;
	/**
	 * The debounce time in ms to wait for group searches
	 * @default 500
	 */
	groupSearchDebounceTime?: number;
	/**
	 * The debounce time in ms to wait for data searches
	 * @default 500
	 */
	dataSearchDebounceTime?: number;
	/**
	 * Sort settings for Groups
	 */
	groupSort?: DataGridSortSetting[];
	/**
	 * Sort settings for Data
	 */
	dataSort?: DataGridSortSetting[];
	/**
	 * LRU options for group selector
	 */
	lruGroup?: BackendSingleSelectLruOptions<GroupDataT>;
	/**
	 * LRU options for data selector
	 */
	lruData?: BackendMultiSelectLruOptions<DataDataT>;
}

/**
 * Backend connected MultiSelectWithTags
 * @remarks Doesn't support custom data
 * @constructor
 */
const BackendMultiSelectWithTags = <
	GroupKeyT extends ModelFieldName,
	DataKeyT extends ModelFieldName,
	GroupVisibilityT extends PageVisibility,
	DataVisibilityT extends PageVisibility,
	GroupCustomT,
	DataCustomT,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData,
>(
	props: BackendMultiSelectWithTagsProps<
		GroupKeyT,
		DataKeyT,
		GroupVisibilityT,
		DataVisibilityT,
		GroupCustomT,
		DataCustomT,
		GroupDataT,
		DataDataT
	>,
) => {
	const {
		groupModel,
		convGroup,
		getGroupDataEntries,
		dataModel,
		convData,
		switchFilterNameData,
		switchFilterNameGroup,
		initialData,
		onChange,
		groupSearchDebounceTime,
		dataSearchDebounceTime,
		selected: selectedIds,
		dataSort,
		groupSort,
		lruGroup,
		lruData,
		...selectorProps
	} = props;

	const { handleSelect, selected } = useSelectedCache({
		model: dataModel,
		modelToSelectorData: convData,
		initialData,
		onSelect: onChange,
		selected: selectedIds,
	});

	const loadGroupEntries = useCallback(
		async (data: BaseSelectorData) => {
			return getGroupDataEntries(await groupModel.getCached(data.value));
		},
		[getGroupDataEntries, groupModel],
	);
	const loadGroupOptions = useCallback(
		async (query: string, switchValue: boolean) => {
			const [records] = await groupModel.index({
				page: 1,
				quickFilter: query,
				sort: groupSort,
				additionalFilters: switchFilterNameGroup
					? { [switchFilterNameGroup]: switchValue }
					: undefined,
			});
			return Promise.all(records.map(convGroup));
		},
		[convGroup, groupModel, groupSort, switchFilterNameGroup],
	);
	const loadDataOptions = useCallback(
		async (query: string, switchValue: boolean) => {
			const [records] = await dataModel.index({
				page: 1,
				quickFilter: query,
				sort: dataSort,
				additionalFilters: switchFilterNameData
					? { [switchFilterNameData]: switchValue }
					: undefined,
			});
			return Promise.all(records.map(convData));
		},
		[convData, dataModel, dataSort, switchFilterNameData],
	);

	const handleLoadGroupRecord = useCallback(
		async (id: string): Promise<GroupDataT> => {
			const [data] = await groupModel.getCached(id);
			return convGroup(data);
		},
		[groupModel, convGroup],
	);

	const lruGroupConfig: SelectorLruOptions<GroupDataT> | undefined = useMemo(
		() =>
			lruGroup
				? {
						...lruGroup,
						loadData: handleLoadGroupRecord,
					}
				: undefined,
		[lruGroup, handleLoadGroupRecord],
	);

	const handleLoadDataRecord = useCallback(
		async (id: string): Promise<DataDataT> => {
			const [data] = await dataModel.getCached(id);
			return convData(data);
		},
		[dataModel, convData],
	);

	const lruDataConfig: SelectorLruOptions<DataDataT> | undefined = useMemo(
		() =>
			lruData
				? {
						...lruData,
						loadData: handleLoadDataRecord,
					}
				: undefined,
		[lruData, handleLoadDataRecord],
	);

	const debouncedGroupLoad = useMemo(
		() => debouncePromise(loadGroupOptions, groupSearchDebounceTime ?? 500),
		[groupSearchDebounceTime, loadGroupOptions],
	);
	const debouncedDataLoad = useMemo(
		() => debouncePromise(loadDataOptions, dataSearchDebounceTime ?? 500),
		[dataSearchDebounceTime, loadDataOptions],
	);

	return (
		<MultiSelectWithTags
			{...selectorProps}
			onChange={handleSelect}
			selected={selected}
			loadGroupEntries={loadGroupEntries}
			loadDataOptions={debouncedDataLoad}
			loadGroupOptions={debouncedGroupLoad}
			displaySwitch={!!(switchFilterNameGroup || switchFilterNameData)}
			lruGroup={lruGroupConfig}
			lruData={lruDataConfig}
		/>
	);
};

export default React.memo(
	BackendMultiSelectWithTags,
) as typeof BackendMultiSelectWithTags;
