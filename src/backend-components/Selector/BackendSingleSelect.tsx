import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useThemeProps } from "@mui/material";
import {
	BaseSelectorData,
	BaseSelectorLoadResult,
	BaseSelectorProps,
	SelectorLruOptions,
	SingleSelect,
} from "../../standalone";
import {
	ModelRecord,
	ModelUnknown,
} from "../../backend-integration/Model/Model";
import useCCTranslations from "../../utils/useCCTranslations";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";
import getSelectedLoadErrorLabel from "./getSelectedLoadErrorLabel";
import useDebouncedLoad from "./useDebouncedLoad";

export type BackendSingleSelectLruOptions<DataT extends BaseSelectorData> =
	Omit<SelectorLruOptions<DataT>, "loadData">;

export interface BackendSingleSelectProps<M extends ModelUnknown> extends Omit<
	BaseSelectorProps<BaseSelectorData, false>,
	"onLoad" | "selected" | "onSelect" | "lru"
> {
	/**
	 * The model to use
	 */
	model: M;
	/**
	 * The model to use for fetch requests (to enable request batching)
	 */
	modelFetch?: M;
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
		modelData: ModelRecord<M>,
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
	 * The id of the selected record, or null (undefined counts as null). Shown from a
	 * matching `additionalOptions` entry or `initialData` record without a request,
	 * otherwise loaded through `modelFetch`. Until the record of this id is there, the
	 * field shows the translated "Loading…" (`backend-components.selector.loading`), never
	 * the record of an earlier id, and a lookup of an earlier id that finishes later is
	 * discarded (also its error: no `onLoadError`, no `onSelect(null)`). Not shown while
	 * `selectedFreeSolo` is a non-empty string.
	 */
	selected: string | null;
	/**
	 * Sort settings
	 */
	sort?: DataGridSortSetting[];
	/**
	 * Initial data (model format) used for selected cache
	 */
	initialData?: ModelRecord<M>[];
	/**
	 * LRU settings
	 */
	lru?: BackendSingleSelectLruOptions<BaseSelectorData>;
	/**
	 * Load error event
	 * @param error The error that has been raised while loading
	 * @return string Label for entry which failed loading
	 * @return null To remove entry from selected entries
	 * @remarks Without it, the entry is labelled "Unknown entry" if the backend did not
	 *          return its record, else "Error while fetching data".
	 */
	onLoadError?: (error: Error) => string | null;
	/**
	 * Disable request batching
	 */
	disableRequestBatching?: boolean;
	/**
	 * onSelect handler for free solo values
	 * @param value The value selected
	 */
	onSelectFreeSolo?: (value: string) => void;
	/**
	 * Currently selected freeSolo value
	 */
	selectedFreeSolo?: string | null;
}

/**
 * Themable subset of BackendSingleSelectProps (used for theme defaultProps)
 * @remarks Excludes the props which are specific to a single instance (model, selection, callbacks)
 */
export type BackendSingleSelectThemeProps = Omit<
	BackendSingleSelectProps<ModelUnknown>,
	| "model"
	| "modelFetch"
	| "modelToSelectorData"
	| "selected"
	| "onSelect"
	| "initialData"
	| "lru"
	| "selectedFreeSolo"
	| "onSelectFreeSolo"
>;

const BackendSingleSelect = <M extends ModelUnknown>(
	inProps: BackendSingleSelectProps<M>,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcBackendSingleSelect",
	});
	const {
		model,
		modelFetch: modelFetchProp,
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
		disableRequestBatching,
		freeSolo,
		selectedFreeSolo,
		onSelectFreeSolo,
		...otherProps
	} = props;
	const modelFetch = modelFetchProp ?? model;

	if (freeSolo && !onSelectFreeSolo)
		throw new Error("freeSolo enabled, but no onSelectFreeSolo callback");

	// the entry picked from the list last, shown for its id until the effect below
	// has taken it into the cache, so a pick does not show "Loading…" in between
	const [picked, setPicked] = useState<BaseSelectorData | null>(null);
	const [selectedCache, setSelectedCache] = useState<BaseSelectorData | null>(
		null,
	);

	const { t } = useCCTranslations();

	const handleLoad = useCallback(
		async (
			search: string,
		): Promise<BaseSelectorLoadResult<BaseSelectorData>> => {
			const [records, meta] = await model.index({
				page: 1,
				rows: searchResultLimit ?? 25,
				sort: sort,
				quickFilter: search,
			});
			return {
				options: await Promise.all(
					records.map((record) => Promise.resolve(modelToSelectorData(record))),
				),
				total: meta.filteredRows ?? meta.totalRows,
			};
		},
		[model, searchResultLimit, sort, modelToSelectorData],
	);

	const handleLoadLruRecord = useCallback(
		async (id: string): Promise<BaseSelectorData> => {
			const [data] = await modelFetch.getCached(id, {
				batch: !disableRequestBatching,
				dontReportNotFoundInBatch: true,
			});
			return modelToSelectorData(data);
		},
		[modelFetch, modelToSelectorData, disableRequestBatching],
	);

	const lruConfig: SelectorLruOptions<BaseSelectorData> | undefined = useMemo(
		() =>
			lru
				? {
						...lru,
						loadData: handleLoadLruRecord,
					}
				: undefined,
		[lru, handleLoadLruRecord],
	);

	const handleSelect = useCallback(
		(selected: BaseSelectorData | null) => {
			if (selected && selected.freeSolo) {
				// free solo
				if (onSelectFreeSolo) onSelectFreeSolo(selected.value);
				return;
			}
			setPicked(selected);
			if (onSelect) {
				onSelect(selected ? selected.value : null);
			}
		},
		[onSelect, onSelectFreeSolo],
	);

	// fetch missing data entries
	useEffect(() => {
		if (selected == null) return;
		if (selectedCache?.value === selected) return;

		// no need to fetch additional options
		const additionalOption = additionalOptions?.find(
			(opt) => opt.value === selected,
		);
		if (additionalOption) {
			setSelectedCache(additionalOption);
			return;
		}

		// if this comes from selection no need to fetch it either
		if (picked && picked.value === selected) {
			setSelectedCache(picked);
			setPicked(null);
		}

		// set when selected changes again or the field unmounts: what is loaded for this
		// id then is discarded, so it can neither replace the entry of the new id nor
		// drop it
		let discarded = false;
		void (async () => {
			let newCache: BaseSelectorData | null = null;
			if (initialData) {
				// process initial data
				const selectedRecord = initialData.find(
					(record) => record["id" as keyof typeof record] === selected,
				);
				if (selectedRecord) {
					newCache = await modelToSelectorData(selectedRecord);
				}
			}

			if (!newCache) {
				try {
					const data = await modelFetch.getCached(selected, {
						batch: !disableRequestBatching,
					});
					newCache = await modelToSelectorData(data[0]);
				} catch (e) {
					if (discarded) return;
					const label = getSelectedLoadErrorLabel(
						selected,
						e as Error,
						onLoadError,
						t,
					);
					// if we should drop the record...
					if (!label) {
						// unselect it
						if (onSelect) onSelect(null);
						newCache = null;
						return;
					}
					newCache = {
						value: selected,
						label,
					};
				}
			}
			if (discarded) return;
			setSelectedCache((oldCache) => Object.assign({}, oldCache, newCache));
		})();
		return () => {
			discarded = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected]);

	// the entry of selected: the cached one only while it is this id's, else one that
	// is known without loading it (just picked, or an additionalOptions entry; the
	// effect above caches it), else null while it loads
	const selectedEntry =
		selected == null
			? null
			: selectedCache?.value === selected
				? selectedCache
				: picked?.value === selected
					? picked
					: (additionalOptions?.find((opt) => opt.value === selected) ?? null);

	const debouncedLoad = useDebouncedLoad(handleLoad, searchDebounceTime ?? 500);

	return (
		<SingleSelect
			{...otherProps}
			freeSolo={freeSolo}
			onLoad={debouncedLoad}
			additionalOptions={additionalOptions}
			onSelect={handleSelect}
			selected={
				selectedFreeSolo
					? { value: selectedFreeSolo, label: selectedFreeSolo, freeSolo: true }
					: selected != null
						? (selectedEntry ?? {
								value: selected,
								label: t("backend-components.selector.loading"),
							})
						: null
			}
			lru={lruConfig}
		/>
	);
};

export default React.memo(BackendSingleSelect) as typeof BackendSingleSelect;
