import React, { useCallback, useMemo } from "react";
import { useThemeProps } from "@mui/material";
import {
	BaseSelectorData,
	BaseSelectorLoadResult,
	MultiSelectorData,
	MultiSelectWithTags,
	MultiSelectWithTagsProps,
	SelectorLruOptions,
} from "../../standalone";
import {
	ModelGetResponse,
	ModelRecord,
	ModelUnknown,
} from "../../backend-integration";
import {
	BackendMultiSelectLruOptions,
	useSelectedCache,
} from "./BackendMultiSelect";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";
import { BackendSingleSelectLruOptions } from "./BackendSingleSelect";
import useDebouncedLoad from "./useDebouncedLoad";
import { DistributiveOmit } from "../../utils/distributiveOmit";

/**
 * The switch of a backend multiselect with tags. `switchLabel` is required while
 * `switchFilterNameGroup` or `switchFilterNameData` shows the switch: the visible label
 * is its accessible name. The switch has a row of its own between the search field for
 * entries and the chips, at the right end, with its label before it.
 */
export type BackendMultiSelectWithTagsSwitchProps =
	| {
			/**
			 * Name of the switch filter for groups or undefined if disabled
			 * @default undefined
			 */
			switchFilterNameGroup?: undefined;
			/**
			 * Name of the switch filter for data or undefined if disabled
			 * @default undefined
			 */
			switchFilterNameData?: undefined;
			/**
			 * Label of the switch, which is also its accessible name: pass one with
			 * `switchFilterNameGroup` or `switchFilterNameData`.
			 */
			switchLabel?: React.ReactNode;
	  }
	| {
			/**
			 * Name of the switch filter for groups: with it, or `switchFilterNameData`, the
			 * field shows a switch.
			 */
			switchFilterNameGroup?: string;
			/**
			 * Name of the switch filter for data: with it, or `switchFilterNameGroup`, the
			 * field shows a switch.
			 */
			switchFilterNameData?: string;
			/**
			 * Label of the switch: its visible text and its accessible name.
			 */
			switchLabel: React.ReactNode;
	  };

export type BackendMultiSelectWithTagsProps<
	GroupModelT extends ModelUnknown,
	DataModelT extends ModelUnknown,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData,
> = DistributiveOmit<
	MultiSelectWithTagsProps<DataDataT, GroupDataT>,
	| "loadGroupEntries"
	| "loadDataOptions"
	| "loadGroupOptions"
	| "displaySwitch"
	| "switchLabel"
	| "selected"
	| "onChange"
	| "lruGroup"
	| "lruData"
> &
	BackendMultiSelectWithTagsSwitchProps & {
		/**
		 * The selected data record IDs
		 */
		selected: string[];
		/**
		 * Change event callback
		 * @param selected The ids of the new selection, in order
		 * @param raw The entries of these ids, in the same order. An id whose record is still
		 *        loading (listed as "Loading…") has no entry yet and is left out, so match the
		 *        entries to the ids by `value`, not by position.
		 */
		onChange?: (selected: string[], raw: DataDataT[]) => void;
		/**
		 * Records (model format) of selected ids, which are then shown without a request: a
		 * selected id with a record here is converted from it by `convData` once it is
		 * selected, not loaded through `dataModel`. A conversion that fails lists the id as
		 * "Error while fetching data", like a record that failed to load, without a lookup.
		 */
		initialData?: ModelRecord<DataModelT>[];
		/**
		 * The data source for groups
		 */
		groupModel: GroupModelT;
		/**
		 * Callback that converts a model entry to a base selector entry
		 * @param data The record data (overview)
		 * @returns Selector data
		 * @remarks Selector data value must be set to ID
		 */
		convGroup: (
			data: ModelRecord<GroupModelT>,
		) => Promise<GroupDataT> | GroupDataT;
		/**
		 * Callback that gets the group entries for a given group record
		 * @param data The record data (detailed)
		 * @returns Data selector entries
		 * @remarks Selector data value must be set to ID of data record
		 */
		getGroupDataEntries: (
			data: ModelGetResponse<GroupModelT>,
		) => Promise<DataDataT[]> | DataDataT[];
		/**
		 * The data source for data entries
		 */
		dataModel: DataModelT;
		/**
		 * Callback that converts a model entry to a multi selector entry
		 * @param data The record data (overview)
		 * @returns Selector data
		 * @remarks Selector data value must be set to ID. One that throws or rejects for a
		 *          selected record, loaded or from `initialData`, lists it as "Error while
		 *          fetching data", like a record that failed to load.
		 */
		convData: (data: ModelRecord<DataModelT>) => Promise<DataDataT> | DataDataT;
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
	};

/**
 * Themable subset of BackendMultiSelectWithTagsProps (used for theme defaultProps)
 * @remarks Excludes the props which are specific to a single instance (models, selection, callbacks)
 */
export type BackendMultiSelectWithTagsThemeProps = DistributiveOmit<
	BackendMultiSelectWithTagsProps<
		ModelUnknown,
		ModelUnknown,
		BaseSelectorData,
		MultiSelectorData
	>,
	| "groupModel"
	| "dataModel"
	| "convGroup"
	| "convData"
	| "getGroupDataEntries"
	| "selected"
	| "onChange"
	| "initialData"
	| "lruGroup"
	| "lruData"
>;

/**
 * Backend connected MultiSelectWithTags
 * @remarks Doesn't support custom data
 * @constructor
 */
const BackendMultiSelectWithTags = <
	GroupModelT extends ModelUnknown,
	DataModelT extends ModelUnknown,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData,
>(
	inProps: BackendMultiSelectWithTagsProps<
		GroupModelT,
		DataModelT,
		GroupDataT,
		DataDataT
	>,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcBackendMultiSelectWithTags",
	});
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
		error,
		...selectorProps
	} = props;

	const { handleSelect, selected, loadError } = useSelectedCache({
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
		async (
			query: string,
			switchValue: boolean,
		): Promise<BaseSelectorLoadResult<GroupDataT>> => {
			const [records, meta] = await groupModel.index({
				page: 1,
				quickFilter: query,
				sort: groupSort,
				additionalFilters: switchFilterNameGroup
					? { [switchFilterNameGroup]: switchValue }
					: undefined,
			});
			return {
				options: await Promise.all(
					records.map((record) => Promise.resolve(convGroup(record))),
				),
				total: meta.filteredRows ?? meta.totalRows,
			};
		},
		[convGroup, groupModel, groupSort, switchFilterNameGroup],
	);
	const loadDataOptions = useCallback(
		async (
			query: string,
			switchValue: boolean,
		): Promise<BaseSelectorLoadResult<DataDataT>> => {
			const [records, meta] = await dataModel.index({
				page: 1,
				quickFilter: query,
				sort: dataSort,
				additionalFilters: switchFilterNameData
					? { [switchFilterNameData]: switchValue }
					: undefined,
			});
			return {
				options: await Promise.all(
					records.map((record) => Promise.resolve(convData(record))),
				),
				total: meta.filteredRows ?? meta.totalRows,
			};
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

	const debouncedGroupLoad = useDebouncedLoad(
		loadGroupOptions,
		groupSearchDebounceTime ?? 500,
	);
	const debouncedDataLoad = useDebouncedLoad(
		loadDataOptions,
		dataSearchDebounceTime ?? 500,
	);

	return (
		<MultiSelectWithTags
			{...selectorProps}
			error={error || loadError}
			onChange={handleSelect}
			selected={selected}
			loadGroupEntries={loadGroupEntries}
			loadDataOptions={debouncedDataLoad}
			loadGroupOptions={debouncedGroupLoad}
			{...(switchFilterNameGroup || switchFilterNameData
				? { displaySwitch: true as const, switchLabel: props.switchLabel }
				: { displaySwitch: false as const })}
			lruGroup={lruGroupConfig}
			lruData={lruDataConfig}
		/>
	);
};

export default React.memo(
	BackendMultiSelectWithTags,
) as typeof BackendMultiSelectWithTags;
