import React, { useCallback, useMemo } from "react";
import {
	BaseSelectorData,
	MultiSelectorData,
	MultiSelectWithTags,
	MultiSelectWithTagsProps,
} from "../../standalone";
import {
	Model,
	ModelFieldName,
	ModelGetResponse,
	PageVisibility,
} from "../../backend-integration";
import { useSelectedCache } from "./BackendMultiSelect";
import { debouncePromise } from "../../utils";

export interface BackendMultiSelectWithTagsProps<
	GroupKeyT extends ModelFieldName,
	DataKeyT extends ModelFieldName,
	GroupVisibilityT extends PageVisibility,
	DataVisibilityT extends PageVisibility,
	GroupCustomT,
	DataCustomT
> extends Omit<
		MultiSelectWithTagsProps<MultiSelectorData, BaseSelectorData>,
		| "loadGroupEntries"
		| "loadDataOptions"
		| "loadGroupOptions"
		| "displaySwitch"
		| "selected"
		| "onChange"
	> {
	/**
	 * The selected data record IDs
	 */
	selected: string[];
	/**
	 * Change event callback
	 * @param selected The now selected IDs
	 */
	onChange?: (selected: string[]) => void;
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
		data: Record<GroupKeyT, unknown>
	) => Promise<BaseSelectorData> | BaseSelectorData;
	/**
	 * Callback that gets the group entries for a given group record
	 * @param data The record data (detailed)
	 * @returns Data selector entries
	 * @remarks Selector data value must be set to ID of data record
	 */
	getGroupDataEntries: (
		data: ModelGetResponse<GroupKeyT>
	) => Promise<MultiSelectorData[]> | MultiSelectorData[];
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
	convData: (
		data: Record<DataKeyT, unknown>
	) => Promise<MultiSelectorData> | MultiSelectorData;
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
	DataCustomT
>(
	props: BackendMultiSelectWithTagsProps<
		GroupKeyT,
		DataKeyT,
		GroupVisibilityT,
		DataVisibilityT,
		GroupCustomT,
		DataCustomT
	>
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
		[getGroupDataEntries, groupModel]
	);
	const loadGroupOptions = useCallback(
		async (query: string, switchValue: boolean) => {
			const [records] = await groupModel.index({
				page: 1,
				quickFilter: query,
				additionalFilters: switchFilterNameGroup
					? { [switchFilterNameGroup]: switchValue }
					: undefined,
			});
			return Promise.all(records.map(convGroup));
		},
		[convGroup, groupModel, switchFilterNameGroup]
	);
	const loadDataOptions = useCallback(
		async (query: string, switchValue: boolean) => {
			const [records] = await dataModel.index({
				page: 1,
				quickFilter: query,
				additionalFilters: switchFilterNameData
					? { [switchFilterNameData]: switchValue }
					: undefined,
			});
			return Promise.all(records.map(convData));
		},
		[convData, dataModel, switchFilterNameData]
	);

	const debouncedGroupLoad = useMemo(
		() => debouncePromise(loadGroupOptions, groupSearchDebounceTime ?? 500),
		[groupSearchDebounceTime, loadGroupOptions]
	);
	const debouncedDataLoad = useMemo(
		() => debouncePromise(loadDataOptions, dataSearchDebounceTime ?? 500),
		[dataSearchDebounceTime, loadDataOptions]
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
		/>
	);
};

export default React.memo(
	BackendMultiSelectWithTags
) as typeof BackendMultiSelectWithTags;
