import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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
import debouncePromise from "../../utils/debouncePromise";
import useCCTranslations from "../../utils/useCCTranslations";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";
import getSelectedLoadErrorLabel from "./getSelectedLoadErrorLabel";

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

	const upcomingSelectedCache = useRef<BaseSelectorData | null>(null);
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
			upcomingSelectedCache.current = selected;
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
		if (
			upcomingSelectedCache.current &&
			upcomingSelectedCache.current.value === selected
		) {
			setSelectedCache(upcomingSelectedCache.current);
			upcomingSelectedCache.current = null;
		}

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
			setSelectedCache((oldCache) => Object.assign({}, oldCache, newCache));
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected]);

	const debouncedLoad = useMemo(
		() => debouncePromise(handleLoad, searchDebounceTime ?? 500),
		[handleLoad, searchDebounceTime],
	);

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
						? (selectedCache ?? {
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
