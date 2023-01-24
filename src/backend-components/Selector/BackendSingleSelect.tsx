import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	BaseSelectorData,
	BaseSelectorProps,
	getStringLabel,
	SelectorLruOptions,
	SingleSelect,
} from "../../standalone";
import Model, {
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import { debouncePromise } from "../../utils";
import useCCTranslations from "../../utils/useCCTranslations";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";

export type BackendSingleSelectLruOptions<
	DataT extends BaseSelectorData
> = Omit<SelectorLruOptions<DataT>, "loadData">;

export interface BackendSingleSelectProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends Omit<
		BaseSelectorProps<BaseSelectorData>,
		"onLoad" | "selected" | "onSelect" | "lru"
	> {
	/**
	 * The model to use
	 */
	model: Model<KeyT, VisibilityT, CustomT>;
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
	) => Promise<BaseSelectorData> | BaseSelectorData;
	/**
	 * The amount of search results to load (defaults to 25)
	 */
	searchResultLimit?: number;
	/**
	 * Selection change handler
	 * @param data The selected data entry/entries values
	 */
	onSelect?: (value: string | null) => void;
	/**
	 * The currently selected values
	 */
	selected: string | null;
	/**
	 * Sort settings
	 */
	sort?: DataGridSortSetting[];
	/**
	 * Initial data (model format) used for selected cache
	 */
	initialData?: Record<string, unknown>[];
	/**
	 * LRU settings
	 */
	lru?: BackendSingleSelectLruOptions<BaseSelectorData>;
	/**
	 * Load error event
	 * @param error The error that has been raised while loading
	 * @return string Label for entry which failed loading
	 * @return null To remove entry from selected entries
	 */
	onLoadError?: (error: Error) => string | null;
	/**
	 * Additional options to choose from (not provided by backend).
	 * @remarks Has no effect if LRU. Will be shown at the top of the list
	 */
	additionalOptions?: BaseSelectorData[];
}

const BackendSingleSelect = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	props: BackendSingleSelectProps<KeyT, VisibilityT, CustomT>
) => {
	const {
		model,
		modelToSelectorData,
		searchResultLimit,
		onSelect,
		selected,
		initialData,
		searchDebounceTime,
		sort,
		lru,
		onLoadError,
		additionalOptions,
		...otherProps
	} = props;

	const [selectedCache, setSelectedCache] = useState<BaseSelectorData | null>(
		null
	);

	const { t } = useCCTranslations();

	const handleLoad = useCallback(
		async (search: string) => {
			const data = await model.index({
				page: 1,
				rows: searchResultLimit ?? 25,
				sort: sort,
				quickFilter: search,
			});
			return [
				...(additionalOptions ?? []).filter((x) =>
					getStringLabel(x).toLowerCase().includes(search.toLowerCase())
				),
				...(await Promise.all(data[0].map(modelToSelectorData))),
			];
		},
		[model, searchResultLimit, sort, additionalOptions, modelToSelectorData]
	);

	const handleLoadRecord = useCallback(
		async (id: string): Promise<BaseSelectorData> => {
			const [data] = await model.getCached(id);
			return modelToSelectorData(data);
		},
		[model, modelToSelectorData]
	);

	const lruConfig: SelectorLruOptions<BaseSelectorData> | undefined = useMemo(
		() =>
			lru
				? {
						...lru,
						loadData: handleLoadRecord,
				  }
				: undefined,
		[lru, handleLoadRecord]
	);

	const handleSelect = useCallback(
		(selected: BaseSelectorData | null) => {
			setSelectedCache(selected);
			if (onSelect) {
				onSelect(selected ? selected.value : null);
			}
		},
		[onSelect]
	);

	// fetch missing data entries
	useEffect(() => {
		if (!selected) return;
		if (selectedCache?.value === selected) return;

		// no need to fetch additional options
		const additionalOption = additionalOptions?.find(
			(opt) => opt.value === selected
		);
		if (additionalOption) {
			setSelectedCache(additionalOption);
			return;
		}

		void (async () => {
			let newCache: BaseSelectorData | null = null;
			if (initialData) {
				// process initial data
				const selectedRecord = initialData.find(
					(record) => record["id" as keyof typeof record] === selected
				);
				if (selectedRecord) {
					newCache = await modelToSelectorData(selectedRecord);
				}
			}

			if (!newCache) {
				try {
					const data = await model.getCached(selected);
					newCache = await modelToSelectorData(data[0]);
				} catch (e) {
					const err = e as Error;
					let errorMsg =
						err.message ?? t("backend-components.selector.loading-error");
					if (onLoadError) {
						const result = onLoadError(err);
						// if we should drop the record...
						if (!result) {
							// unselect it
							if (onSelect) onSelect(null);
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

	const debouncedLoad = useMemo(
		() => debouncePromise(handleLoad, searchDebounceTime ?? 500),
		[handleLoad, searchDebounceTime]
	);

	return (
		<SingleSelect
			{...otherProps}
			onLoad={debouncedLoad}
			onSelect={handleSelect}
			selected={
				selected
					? selectedCache ?? {
							value: selected,
							label: t("backend-components.selector.loading"),
					  }
					: null
			}
			lru={lruConfig}
		/>
	);
};

export default React.memo(BackendSingleSelect) as typeof BackendSingleSelect;
