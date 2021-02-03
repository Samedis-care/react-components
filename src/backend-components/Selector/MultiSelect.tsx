import React, { useCallback, useEffect, useState } from "react";
import {
	BaseSelectorData,
	MultiSelect,
	MultiSelectorData,
	MultiSelectProps,
} from "../../standalone";
import Model, {
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import ccI18n from "../../i18n";

export interface BackendMultiSelectProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends Omit<MultiSelectProps, "onLoad" | "selected" | "onSelect"> {
	/**
	 * The model to use
	 */
	model: Model<KeyT, VisibilityT, CustomT>;
	/**
	 * Callback that converts the model data to the actual data displayed in the selector
	 * @param modelData The model data
	 */
	modelToSelectorData: (
		modelData: Record<KeyT, unknown>
	) => Promise<MultiSelectorData> | MultiSelectorData;
	/**
	 * The amount of search results to load (defaults to 25)
	 */
	searchResultLimit?: number;
	/**
	 * Selection change handler
	 * @param data The selected data entry/entries values
	 */
	onSelect?: (value: string[]) => void;
	/**
	 * The currently selected values
	 */
	selected: string[];
}

const BackendMultiSelect = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	props: BackendMultiSelectProps<KeyT, VisibilityT, CustomT>
) => {
	const {
		model,
		modelToSelectorData,
		searchResultLimit,
		onSelect,
		selected,
		...otherProps
	} = props;

	const [selectedCache, setSelectedCache] = useState<
		Record<string, MultiSelectorData>
	>({});

	const handleLoad = useCallback(
		async (search: string) => {
			const data = await model.index({
				page: 1,
				rows: searchResultLimit ?? 25,
				quickFilter: search,
			});
			return Promise.all(data[0].map(modelToSelectorData));
		},
		[model, modelToSelectorData, searchResultLimit]
	);

	const handleSelect = useCallback(
		(selected: MultiSelectorData[]) => {
			setSelectedCache((cache) => {
				const newCache = { ...cache };
				selected.forEach((entry) => (newCache[entry.value] = entry));
				return newCache;
			});
			if (onSelect) {
				onSelect(selected.map((entry) => entry.value));
			}
		},
		[onSelect]
	);

	// fetch missing data entries
	useEffect(() => {
		void (async () => {
			const newCache: Record<string, MultiSelectorData> = {};
			await Promise.all(
				selected
					.filter((value) => !(value in selectedCache))
					.map(async (value) => {
						try {
							const data = await model.getRaw(value);
							newCache[value] = await modelToSelectorData(data);
						} catch (e) {
							newCache[value] = {
								value,
								label:
									(e as Error).message ??
									ccI18n.t("backend-components.selector.loading-error"),
							};
						}
					})
			);
			setSelectedCache((oldCache) => Object.assign({}, oldCache, newCache));
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected]);

	return (
		<MultiSelect
			{...otherProps}
			onLoad={handleLoad}
			onSelect={handleSelect}
			selected={selected.map(
				(value) =>
					selectedCache[value] ?? {
						value,
						label: ccI18n.t("backend-components.selector.loading"),
					}
			)}
		/>
	);
};

export default React.memo(BackendMultiSelect) as typeof BackendMultiSelect;
