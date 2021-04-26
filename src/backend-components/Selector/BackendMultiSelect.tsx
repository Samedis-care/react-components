import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	MultiSelect,
	MultiSelectProps,
	MultiSelectorData,
} from "../../standalone";
import Model, {
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";
import { debouncePromise } from "../../utils";

export interface BackendMultiSelectProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData
> extends Omit<MultiSelectProps<DataT>, "onLoad" | "selected" | "onSelect"> {
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
		modelData: Record<KeyT, unknown>
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
	initialData?: Record<KeyT, unknown>[];
	/**
	 * Name of the switch filter or undefined if disabled
	 */
	switchFilterName?: string;
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
		"model" | "modelToSelectorData" | "onSelect" | "selected" | "initialData"
	>
): UseSelectedCacheResult<DataT> => {
	const { model, modelToSelectorData, onSelect, selected, initialData } = props;

	const [selectedCache, setSelectedCache] = useState<Record<string, DataT>>({});

	const { t } = useTranslation(undefined, { i18n });

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
			await Promise.all(
				selected
					.filter((value) => !(value in selectedCache) && !(value in newCache))
					.map(async (value) => {
						try {
							const data = await model.getCached(value);
							newCache[value] = await modelToSelectorData(data[0]);
						} catch (e) {
							newCache[value] = {
								value,
								label:
									(e as Error).message ??
									t("backend-components.selector.loading-error"),
							};
						}
					})
			);
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
		modelToSelectorData,
		searchResultLimit,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onSelect,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		selected: selectedIds,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		initialData,
		searchDebounceTime,
		switchFilterName,
		...otherProps
	} = props;

	const { selected, handleSelect } = useSelectedCache(props);

	const handleLoad = useCallback(
		async (search: string, switchValue: boolean) => {
			const data = await model.index({
				page: 1,
				rows: searchResultLimit ?? 25,
				quickFilter: search,
				additionalFilters: switchFilterName
					? { [switchFilterName]: switchValue }
					: undefined,
			});
			return Promise.all(data[0].map(modelToSelectorData));
		},
		[model, modelToSelectorData, searchResultLimit, switchFilterName]
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
		/>
	);
};

export default React.memo(BackendMultiSelect) as typeof BackendMultiSelect;
