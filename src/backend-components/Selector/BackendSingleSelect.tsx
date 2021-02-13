import React, { useCallback, useEffect, useState } from "react";
import {
	BaseSelectorData,
	SingleSelect,
	SingleSelectorProps,
} from "../../standalone";
import Model, {
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import ccI18n from "../../i18n";

export interface BackendSingleSelectProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends Omit<
		SingleSelectorProps<BaseSelectorData>,
		"onLoad" | "selected" | "onSelect"
	> {
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
	 * Initial data (model format) used for selected cache
	 */
	initialData?: Record<KeyT, unknown>[];
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
		...otherProps
	} = props;

	const [selectedCache, setSelectedCache] = useState<BaseSelectorData | null>(
		null
	);

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
					newCache = {
						value: selected,
						label:
							(e as Error).message ??
							ccI18n.t("backend-components.selector.loading-error"),
					};
				}
			}
			setSelectedCache((oldCache) => Object.assign({}, oldCache, newCache));
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected]);

	return (
		<SingleSelect
			{...otherProps}
			onLoad={handleLoad}
			onSelect={handleSelect}
			selected={
				selected
					? selectedCache ?? {
							value: selected,
							label: ccI18n.t("backend-components.selector.loading"),
					  }
					: null
			}
		/>
	);
};

export default React.memo(BackendSingleSelect) as typeof BackendSingleSelect;
