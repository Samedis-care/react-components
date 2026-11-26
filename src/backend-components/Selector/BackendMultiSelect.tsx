import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useThemeProps } from "@mui/material";
import {
	BaseSelectorLoadResult,
	MultiSelect,
	MultiSelectProps,
	MultiSelectorData,
	SelectorLruOptions,
} from "../../standalone";
import {
	ModelRecord,
	ModelUnknown,
} from "../../backend-integration/Model/Model";
import useCCTranslations from "../../utils/useCCTranslations";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";
import getSelectedLoadErrorLabel from "./getSelectedLoadErrorLabel";
import useDebouncedLoad from "./useDebouncedLoad";
import { DistributiveOmit } from "../../utils/distributiveOmit";

export type BackendMultiSelectLruOptions<DataT extends MultiSelectorData> =
	Omit<SelectorLruOptions<DataT>, "loadData">;

/**
 * Marks the "Loading…" entry listed for a selected id whose record is still loading. The
 * selector hands it back with the next change like any entry, but it is none: it is not
 * reported in `onSelect`'s `raw` and never replaces a loaded entry.
 */
const LOADING_PLACEHOLDER = Symbol("BackendMultiSelect loading placeholder");

const makeLoadingPlaceholder = (
	value: string,
	label: string,
): MultiSelectorData => {
	const placeholder = { value, label, [LOADING_PLACEHOLDER]: true };
	return placeholder;
};

const isLoadingPlaceholder = (entry: MultiSelectorData): boolean =>
	LOADING_PLACEHOLDER in entry;

/**
 * The switch of a backend multi select. `switchLabel` is required while a
 * `switchFilterName` shows the switch: the visible label is its accessible name.
 */
export type BackendMultiSelectSwitchProps =
	| {
			/**
			 * Name of the switch filter or undefined if disabled
			 * @default undefined (no switch, searches send no additionalFilters)
			 */
			switchFilterName?: undefined;
			/**
			 * Label of the switch, which is also its accessible name: pass one with
			 * `switchFilterName`. Ignored without `switchFilterName`.
			 */
			switchLabel?: React.ReactNode;
	  }
	| {
			/**
			 * Name of the switch filter: with it the field shows a switch, and searches
			 * send `additionalFilters: { [switchFilterName]: switchValue }`.
			 */
			switchFilterName: string;
			/**
			 * Label of the switch: its visible text and its accessible name.
			 */
			switchLabel: React.ReactNode;
	  };

export type BackendMultiSelectProps<
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
> = DistributiveOmit<
	MultiSelectProps<DataT>,
	"onLoad" | "selected" | "onSelect" | "lru" | "displaySwitch" | "switchLabel"
> &
	BackendMultiSelectSwitchProps & {
		/**
		 * The model to use
		 */
		model: M;
		/**
		 * The model to use for fetch requests (to enable request batching)
		 */
		modelFetch?: M;
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
		 * @remarks One that throws or rejects for a selected record, loaded or from
		 *          `initialData`, lists it like a record that failed to load (see `onLoadError`).
		 */
		modelToSelectorData: (modelData: ModelRecord<M>) => Promise<DataT> | DataT;
		/**
		 * The amount of search results to load (defaults to 25)
		 */
		searchResultLimit?: number;
		/**
		 * Selection change handler
		 * @param value The ids of the new selection, in order
		 * @param raw The entries of these ids, in the same order. An id whose record is still
		 *        loading (listed as "Loading…") has no entry yet and is left out, so match the
		 *        entries to the ids by `value`, not by position.
		 */
		onSelect?: (value: string[], raw: DataT[]) => void;
		/**
		 * The ids of the selected records, listed in this order. An id is shown from a
		 * matching `additionalOptions` entry (never looked up, never dropped by
		 * `onLoadError`), an `initialData` record or an entry picked in this field without a
		 * request, otherwise loaded through `modelFetch`; until then it is listed as a
		 * translated "Loading…" entry.
		 */
		selected: string[];
		/**
		 * Records (model format) of selected ids, which are then shown without a request: a
		 * selected id with a record here is converted from it by `modelToSelectorData` once it
		 * is selected, not loaded through `modelFetch`. A conversion that fails lists the id
		 * like a record that failed to load (see `onLoadError`), without a lookup.
		 */
		initialData?: ModelRecord<M>[];
		/**
		 * Sort settings
		 */
		sort?: DataGridSortSetting[];
		/**
		 * LRU config
		 */
		lru?: BackendMultiSelectLruOptions<DataT>;
		/**
		 * Load error event
		 * @param error The error that has been raised while loading, or by `modelToSelectorData`
		 *        while converting the loaded or `initialData` record
		 * @return string Label for entry which failed loading
		 * @return null To remove the entry: `onSelect` reports the current selection without
		 *         its id, so a pick or removal made while it loaded is kept (an id picked
		 *         again meanwhile stays). Not reported once the field has unmounted.
		 * @remarks Without it, the entry is labelled "Unknown entry" if the backend did not
		 *          return its record, else "Error while fetching data".
		 */
		onLoadError?: (error: Error) => string | null;
	};

interface UseSelectedCacheResult<DataT extends MultiSelectorData> {
	/**
	 * The currently selected entries
	 */
	selected: DataT[];
	/**
	 * Event handler for the selection event: caches the entries and calls `onSelect` with
	 * their ids and the entries, without the "Loading…" ones
	 */
	handleSelect: (selected: DataT[]) => void;
}

export const useSelectedCache = <
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
>(
	props: Pick<
		BackendMultiSelectProps<M, DataT>,
		| "model"
		| "modelFetch"
		| "disableRequestBatching"
		| "modelToSelectorData"
		| "onSelect"
		| "selected"
		| "initialData"
		| "onLoadError"
		| "additionalOptions"
	>,
): UseSelectedCacheResult<DataT> => {
	const {
		model,
		disableRequestBatching,
		modelToSelectorData,
		onSelect,
		selected,
		initialData,
		onLoadError,
		additionalOptions,
	} = props;
	const modelFetch = props.modelFetch ?? model;

	const [selectedCache, setSelectedCache] = useState<Record<string, DataT>>({});

	// the selection, entries and handler of the latest render: a drop by onLoadError
	// removes its ids from this selection, not from the one its lookup started with
	const latest = useRef({ selected, selectedCache, onSelect });
	latest.current = { selected, selectedCache, onSelect };
	// lookups that end after unmount neither report a drop nor fill the cache
	const mounted = useRef(false);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const { t } = useCCTranslations();

	const handleSelect = useCallback(
		(selected: DataT[]) => {
			setSelectedCache((cache) => {
				const newCache = { ...cache };
				selected.forEach((entry) => {
					// a placeholder handed back keeps its id from being looked up twice, but
					// never replaces the entry that loaded meanwhile (a group pick reports late)
					if (isLoadingPlaceholder(entry) && entry.value in newCache) return;
					newCache[entry.value] = entry;
				});
				return newCache;
			});
			if (onSelect) {
				onSelect(
					selected.map((entry) => entry.value),
					selected.filter((entry) => !isLoadingPlaceholder(entry)),
				);
			}
		},
		[onSelect],
	);

	// fetch missing data entries
	useEffect(() => {
		void (async () => {
			const newCache: Record<string, DataT | MultiSelectorData> = {};
			// an additionalOptions entry is not a record: listed as it is, never looked up
			additionalOptions?.forEach((option) => {
				if (selected.includes(option.value) && !(option.value in selectedCache))
					newCache[option.value] = option;
			});
			const isIdNotInCache = (value: string): boolean =>
				!(value in selectedCache) && !(value in newCache);
			await Promise.all(
				selected.filter(isIdNotInCache).map(async (value) => {
					try {
						// an id with an initialData record is converted from it, any other loaded;
						// a conversion that fails is a failed load either way
						const record =
							initialData?.find(
								(record) => (record as Record<"id", string>).id === value,
							) ??
							(
								await modelFetch.getCached(value, {
									batch: !disableRequestBatching,
								})
							)[0];
						newCache[value] = await modelToSelectorData(record);
					} catch (e) {
						const label = getSelectedLoadErrorLabel(
							value,
							e as Error,
							onLoadError,
							t,
						);
						// if we should drop the record return here and don't create a record in cache
						if (!label) {
							return;
						}
						newCache[value] = {
							value,
							label,
						};
					}
				}),
			);

			if (!mounted.current) return;

			// the ids onLoadError dropped leave the current selection, so a pick or removal
			// made while they loaded is kept; an id picked again meanwhile has an entry and stays
			const dropped = selected.filter(isIdNotInCache);
			const current = latest.current;
			const newSelection = current.selected.filter((id) => {
				if (!dropped.includes(id)) return true;
				const entry = current.selectedCache[id] as DataT | undefined;
				return entry !== undefined && !isLoadingPlaceholder(entry);
			});
			if (current.onSelect && newSelection.length < current.selected.length) {
				// a second drop before the parent has rendered this one starts from it
				latest.current = { ...current, selected: newSelection };
				current.onSelect(
					newSelection,
					newSelection
						.map((id) => newCache[id] ?? current.selectedCache[id])
						.filter(
							(entry): entry is DataT =>
								entry !== undefined && !isLoadingPlaceholder(entry),
						),
				);
			}

			setSelectedCache((oldCache) => Object.assign({}, oldCache, newCache));
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected]);

	// stable identity: a new array on every render makes the selector reset its search
	const selectedData = useMemo(
		(): DataT[] =>
			selected.map(
				(value) =>
					selectedCache[value] ??
					(makeLoadingPlaceholder(
						value,
						t("backend-components.selector.loading"),
					) as DataT),
			),
		[selected, selectedCache, t],
	);

	return {
		selected: selectedData,
		handleSelect,
	};
};

/**
 * Themable subset of BackendMultiSelectProps (used for theme defaultProps)
 * @remarks Excludes the props which are specific to a single instance (model, selection, callbacks)
 */
export type BackendMultiSelectThemeProps = DistributiveOmit<
	BackendMultiSelectProps<ModelUnknown, MultiSelectorData>,
	| "model"
	| "modelFetch"
	| "modelToSelectorData"
	| "selected"
	| "onSelect"
	| "initialData"
	| "lru"
>;

/**
 * Backend connected MultiSelect
 * @remarks Doesn't support custom data
 * @constructor
 */
const BackendMultiSelect = <
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
>(
	inProps: BackendMultiSelectProps<M, DataT>,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcBackendMultiSelect",
	});
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
		async (
			search: string,
			switchValue: boolean,
		): Promise<BaseSelectorLoadResult<DataT>> => {
			const [records, meta] = await model.index({
				page: 1,
				rows: searchResultLimit ?? 25,
				quickFilter: search,
				sort: sort,
				additionalFilters: switchFilterName
					? { [switchFilterName]: switchValue }
					: undefined,
			});
			return {
				options: await Promise.all(
					records.map((value) => Promise.resolve(modelToSelectorData(value))),
				),
				total: meta.filteredRows ?? meta.totalRows,
			};
		},
		[model, modelToSelectorData, searchResultLimit, sort, switchFilterName],
	);

	const handleLoadLruRecord = useCallback(
		async (id: string): Promise<DataT> => {
			const [data] = await modelFetch.getCached(id, {
				batch: !disableRequestBatching,
				dontReportNotFoundInBatch: true,
			});
			return modelToSelectorData(data);
		},
		[disableRequestBatching, modelFetch, modelToSelectorData],
	);

	const lruConfig: SelectorLruOptions<DataT> | undefined = useMemo(
		() =>
			lru
				? {
						...lru,
						loadData: handleLoadLruRecord,
					}
				: undefined,
		[lru, handleLoadLruRecord],
	);

	const debouncedLoad = useDebouncedLoad(handleLoad, searchDebounceTime ?? 500);

	return (
		<MultiSelect
			{...otherProps}
			onLoad={debouncedLoad}
			onSelect={handleSelect}
			selected={selected}
			{...(switchFilterName
				? { displaySwitch: true as const, switchLabel: props.switchLabel }
				: { displaySwitch: false as const })}
			lru={lruConfig}
		/>
	);
};

export default React.memo(BackendMultiSelect) as typeof BackendMultiSelect;
