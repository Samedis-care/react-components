import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	MultiSelect,
	MultiSelectProps,
	MultiSelectorData,
	SelectorLruOptions,
} from "../../standalone";
import Model, {
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import { debouncePromise } from "../../utils";
import useCCTranslations from "../../utils/useCCTranslations";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";

export type BackendMultiSelectLruOptions<
	DataT extends MultiSelectorData
> = Omit<SelectorLruOptions<DataT>, "loadData">;

export interface BackendMultiSelectProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData
> extends Omit<
		MultiSelectProps<DataT>,
		"onLoad" | "selected" | "onSelect" | "lru"
	> {
	/**
	 * The model to use
	 */
	model: Model<KeyT, VisibilityT, CustomT>;
	/**
	 * The model to use for fetch requests (to enable request batching)
	 */
	modelFetch?: Model<KeyT, VisibilityT, CustomT>;
	/**
	 * Disable the use of request batching
	 */
	disableRequestBatching?: boolean;
	/**
	 * The debounce time for search in ms
	 * @default 500
	 */
	searchDebounceTime?: number;
	/**
	 * Callback that converts the model data to the actual data displayed in the selector
	 * @param modelData The model data
	 */
	modelToSelectorData: (
		modelData: Record<string, unknown>
	) => Promise<DataT> | DataT;
	/**
	 * The amount of search results to load (defaults to 25)
	 */
	searchResultLimit?: number;
	/**
	 * Selection change handler
	 * @param data The selected data entry/entries values
	 * @param raw The selected data entry/entries
	 */
	onSelect?: (value: string[], raw: DataT[]) => void;
	/**
	 * The currently selected values
	 */
	selected: string[];
	/**
	 * Initial data (model format) used for selected cache
	 */
	initialData?: Record<string, unknown>[];
	/**
	 * Sort settings
	 */
	sort?: DataGridSortSetting[];
	/**
	 * Name of the switch filter or undefined if disabled
	 */
	switchFilterName?: string;
	/**
	 * LRU config
	 */
	lru?: BackendMultiSelectLruOptions<DataT>;
	/**
	 * Load error event
	 * @param error The error that has been raised while loading
	 * @return string Label for entry which failed loading
	 * @return null To remove entry from selected entries
	 */
	onLoadError?: (error: Error) => string | null;
}

interface UseSelectedCacheResult<DataT extends MultiSelectorData> {
	/**
	 * The currently selected entries
	 */
	selected: DataT[];
	/**
	 * Event handler for the selection event
	 */
	handleSelect: (selected: DataT[]) => void;
}

export const useSelectedCache = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData
>(
	props: Pick<
		BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>,
		| "model"
		| "modelFetch"
		| "disableRequestBatching"
		| "modelToSelectorData"
		| "onSelect"
		| "selected"
		| "initialData"
		| "onLoadError"
	>
): UseSelectedCacheResult<DataT> => {
	const {
		model,
		disableRequestBatching,
		modelToSelectorData,
		onSelect,
		selected,
		initialData,
		onLoadError,
	} = props;
	const modelFetch = props.modelFetch ?? model;

	const [selectedCache, setSelectedCache] = useState<Record<string, DataT>>({});

	const { t } = useCCTranslations();

	const handleSelect = useCallback(
		(selected: DataT[]) => {
			setSelectedCache((cache) => {
				const newCache = { ...cache };
				selected.forEach((entry) => (newCache[entry.value] = entry));
				return newCache;
			});
			if (onSelect) {
				onSelect(
					selected.map((entry) => entry.value),
					selected
				);
			}
		},
		[onSelect]
	);

	// fetch missing data entries
	useEffect(() => {
		void (async () => {
			const newCache: Record<string, DataT | MultiSelectorData> = {};
			if (initialData) {
				// process initial data
				await Promise.all(
					initialData
						.filter(
							(record) =>
								!((record as Record<"id", string>).id in selectedCache)
						)
						.map(
							async (record) =>
								(newCache[
									(record as Record<"id", string>).id
								] = await modelToSelectorData(record))
						)
				);
			}
			const isIdNotInCache = (value: string): boolean =>
				!(value in selectedCache) && !(value in newCache);
			await Promise.all(
				selected.filter(isIdNotInCache).map(async (value) => {
					try {
						const data = await modelFetch.getCached(value, {
							batch: !disableRequestBatching,
						});
						newCache[value] = await modelToSelectorData(data[0]);
					} catch (e) {
						const err = e as Error;
						let errorMsg =
							err.message ?? t("backend-components.selector.loading-error");
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
				})
			);

			// now that everything has loaded ensure we actually drop records
			// if we can update and we have something to drop
			if (onSelect && selected.filter(isIdNotInCache).length > 0) {
				// call onSelect with new array
				const newSelection = selected.filter((id) => !isIdNotInCache(id));
				onSelect(
					newSelection,
					newSelection.map((id) => selectedCache[id] ?? newCache[id])
				);
			}

			setSelectedCache((oldCache) => Object.assign({}, oldCache, newCache));
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected]);

	return {
		selected: selected.map(
			(value) =>
				selectedCache[value] ?? {
					value,
					label: t("backend-components.selector.loading"),
				}
		),
		handleSelect,
	};
};

/**
 * Backend connected MultiSelect
 * @remarks Doesn't support custom data
 * @constructor
 */
const BackendMultiSelect = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData
>(
	props: BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>
) => {
	const {
		model,
		disableRequestBatching,
		modelToSelectorData,
		searchResultLimit,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onSelect,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		selected: selectedIds,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		initialData,
		searchDebounceTime,
		sort,
		switchFilterName,
		lru,
		...otherProps
	} = props;
	const modelFetch = props.modelFetch ?? model;

	const { selected, handleSelect } = useSelectedCache(props);

	const handleLoad = useCallback(
		async (search: string, switchValue: boolean) => {
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
		},
		[model, modelToSelectorData, searchResultLimit, sort, switchFilterName]
	);

	const handleLoadRecord = useCallback(
		async (id: string): Promise<DataT> => {
			const [data] = await modelFetch.getCached(id, {
				batch: !disableRequestBatching,
			});
			return modelToSelectorData(data);
		},
		[disableRequestBatching, modelFetch, modelToSelectorData]
	);

	const lruConfig: SelectorLruOptions<DataT> | undefined = useMemo(
		() =>
			lru
				? {
						...lru,
						loadData: handleLoadRecord,
				  }
				: undefined,
		[lru, handleLoadRecord]
	);

	const debouncedLoad = useMemo(
		() => debouncePromise(handleLoad, searchDebounceTime ?? 500),
		[searchDebounceTime, handleLoad]
	);

	return (
		<MultiSelect
			{...otherProps}
			onLoad={debouncedLoad}
			onSelect={handleSelect}
			selected={selected}
			displaySwitch={!!switchFilterName}
			lru={lruConfig}
		/>
	);
};

export default React.memo(BackendMultiSelect) as typeof BackendMultiSelect;
