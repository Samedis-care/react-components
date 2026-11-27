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
import getSelectedLoadKey from "./getSelectedLoadKey";
import {
	isSelectedLoadErrorEntry,
	makeSelectedLoadErrorEntry,
} from "./selectedLoadErrorEntry";
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
		 * @remarks One with other react-query keys than the previous one (another model id
		 *          or cache keys) loads the listed records again through it. A new instance
		 *          of the same model (same keys) does not: it loads the same records.
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
		 *          A new function converts the listed entries again from their records,
		 *          without a request (labels built with `t` follow a language switch). Pass a
		 *          stable one (module level, or useCallback/useMemo on what it reads): a new
		 *          one on every render converts the listed entries on every render.
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
		 * translated "Loading…" entry. An id `onLoadError` dropped is not listed, also while
		 * `selected` keeps it.
		 *
		 * The listed entries follow the props: a new `modelToSelectorData` converts them
		 * again from the records this field listed or loaded for their ids, without a
		 * request (`additionalOptions` entries, and entries of ids whose record it has not
		 * listed, such as a group pick may add, are listed as they are); a `modelFetch`
		 * with other react-query keys or a new `refreshToken` loads them again through
		 * `modelFetch.getCached` (not `additionalOptions` entries), so an app that changed a
		 * record invalidates the model's queries before it changes `refreshToken`. They
		 * stay listed meanwhile.
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
		 *         again meanwhile stays). Not reported once the field has unmounted. The id
		 *         is then no longer listed, also while `selected` keeps it (without
		 *         `onSelect`, or a parent that does not apply the report), so the next change
		 *         the user makes reports the selection without it.
		 * @remarks Without it, the entry is labelled "Unknown entry" if the backend did not
		 *          return its record, else "Error while fetching data". While an entry
		 *          that failed to load is listed, with either label, the field is marked as
		 *          erroneous (`error`, so `aria-invalid="true"`).
		 */
		onLoadError?: (error: Error) => string | null;
	};

/**
 * What an entry listed for a selected id was made with
 */
interface EntryOrigin<M extends ModelUnknown> {
	/**
	 * The modelToSelectorData that converted it from the id's record. Null for an entry not
	 * converted from a record (an additionalOptions entry, one that failed to load, one
	 * picked for an id whose record the field has not listed, such as a group pick may add):
	 * a new modelToSelectorData leaves it as it is.
	 */
	convertedBy: ((modelData: ModelRecord<M>) => unknown) | null;
	/**
	 * The load key (getSelectedLoadKey) when it was made: another one loads the entry again.
	 * Null for an additionalOptions entry, which is never loaded.
	 */
	loadKey: string | null;
}

interface UseSelectedCacheResult<
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
> {
	/**
	 * The entries listed for the selected ids: a "Loading…" one for an id still loading,
	 * none for an id `onLoadError` dropped
	 */
	selected: DataT[];
	/**
	 * Event handler for the selection event: caches the entries and calls `onSelect` with
	 * their ids and the entries, without the "Loading…" ones
	 */
	handleSelect: (selected: DataT[]) => void;
	/**
	 * Whether a selected entry is listed for a record that failed to load (labelled
	 * "Unknown entry", "Error while fetching data" or by `onLoadError`): the field is then
	 * to be marked as erroneous
	 */
	loadError: boolean;
	/**
	 * Converts a record for the list (an option, an LRU entry) with modelToSelectorData and
	 * keeps the record, so a pick of its entry is converted again by a new
	 * modelToSelectorData
	 */
	convert: (record: ModelRecord<M>) => Promise<DataT>;
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
		| "refreshToken"
	>,
): UseSelectedCacheResult<M, DataT> => {
	const {
		model,
		disableRequestBatching,
		modelToSelectorData,
		onSelect,
		selected,
		initialData,
		onLoadError,
		additionalOptions,
		refreshToken,
	} = props;
	const modelFetch = props.modelFetch ?? model;
	const loadKey = getSelectedLoadKey(
		modelFetch,
		!disableRequestBatching,
		refreshToken,
	);

	const [selectedCache, setSelectedCache] = useState<Record<string, DataT>>({});
	// the ids onLoadError dropped: not listed while they are selected without an entry,
	// also when the selection is not updated (no onSelect, or a parent that keeps them)
	const [droppedIds, setDroppedIds] = useState<ReadonlySet<string>>(
		() => new Set(),
	);
	// the record of each id this field listed, loaded or converted, by id: a new
	// modelToSelectorData converts the listed entries again from them, without a request
	const recordsById = useRef(new Map<string, ModelRecord<M>>());
	// what each entry in the cache was made with; "Loading…" placeholders have no origin
	const origins = useRef(new WeakMap<MultiSelectorData, EntryOrigin<M>>());
	// counts the lookups that listed an entry made with props that changed while it
	// loaded: the effect below then makes it again
	const [revision, setRevision] = useState(0);
	// the selection and load key the effect below last ran for: ids without an entry are
	// looked up for a new selection or load key; when only modelToSelectorData (or the
	// revision) changed, they are loading already or onLoadError dropped them
	const lastRun = useRef<{ selected: string[]; loadKey: string } | null>(null);

	// the selection, entries, handler and props of the latest render: a drop by
	// onLoadError removes its ids from this selection, not from the one its lookup
	// started with
	const latest = useRef({
		selected,
		selectedCache,
		onSelect,
		additionalOptions,
		modelToSelectorData,
		loadKey,
	});
	latest.current = {
		selected,
		selectedCache,
		onSelect,
		additionalOptions,
		modelToSelectorData,
		loadKey,
	};
	// whether an entry was made with the current modelToSelectorData and load key, as far
	// as they concern it (an entry without origin is a placeholder: it is being loaded)
	const isCurrent = useCallback((entry: MultiSelectorData): boolean => {
		const origin = origins.current.get(entry);
		return (
			!origin ||
			((origin.convertedBy === null ||
				origin.convertedBy === latest.current.modelToSelectorData) &&
				(origin.loadKey === null || origin.loadKey === latest.current.loadKey))
		);
	}, []);
	// lookups that end after unmount neither report a drop nor fill the cache
	const mounted = useRef(false);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const { t } = useCCTranslations();

	const convert = useCallback(
		async (record: ModelRecord<M>): Promise<DataT> => {
			const entry = await modelToSelectorData(record);
			recordsById.current.set(entry.value, record);
			return entry;
		},
		[modelToSelectorData],
	);

	const handleSelect = useCallback(
		(selected: DataT[]) => {
			// a picked entry is made with the current props: one from the list was converted
			// from a record listed here, an additionalOptions entry is never loaded
			selected.forEach((entry) => {
				if (isLoadingPlaceholder(entry) || origins.current.has(entry)) return;
				const { additionalOptions, modelToSelectorData, loadKey } =
					latest.current;
				const isOption = !!additionalOptions?.some(
					(option) => option.value === entry.value,
				);
				origins.current.set(entry, {
					convertedBy:
						!isOption && recordsById.current.has(entry.value)
							? modelToSelectorData
							: null,
					loadKey: isOption ? null : loadKey,
				});
			});
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

	// fetch missing data entries, convert the entries made with another
	// modelToSelectorData again and load those made with another load key again
	useEffect(() => {
		const loadMissing =
			lastRun.current?.selected !== selected ||
			lastRun.current.loadKey !== loadKey;
		lastRun.current = { selected, loadKey };
		void (async () => {
			const newCache: Record<string, DataT | MultiSelectorData> = {};
			// an additionalOptions entry is not a record: listed as it is, never looked up
			additionalOptions?.forEach((option) => {
				if (
					selected.includes(option.value) &&
					!(option.value in selectedCache)
				) {
					origins.current.set(option, { convertedBy: null, loadKey: null });
					newCache[option.value] = option;
				}
			});
			const isIdNotInCache = (value: string): boolean =>
				!(value in selectedCache) && !(value in newCache);
			const missing = loadMissing ? selected.filter(isIdNotInCache) : [];
			// listed entries made with props that changed since
			const outdated = selected.filter(
				(value) => value in selectedCache && !isCurrent(selectedCache[value]),
			);
			// the ids among them whose record cannot be loaded again and onLoadError dropped
			const droppedListed: string[] = [];
			const lookUp = async (value: string) =>
				(
					await modelFetch.getCached(value, {
						batch: !disableRequestBatching,
					})
				)[0];
			const convertSelected = async (
				value: string,
				record: ModelRecord<M>,
			): Promise<DataT> => {
				const entry = await modelToSelectorData(record);
				recordsById.current.set(value, record);
				origins.current.set(entry, {
					convertedBy: modelToSelectorData,
					loadKey,
				});
				return entry;
			};
			// the entry of an id whose record failed to load, or null to drop the id
			const failedEntry = (value: string, e: unknown) => {
				const label = getSelectedLoadErrorLabel(
					value,
					e as Error,
					onLoadError,
					t,
				);
				if (!label) return null;
				const entry = makeSelectedLoadErrorEntry(value, label);
				origins.current.set(entry, { convertedBy: null, loadKey });
				return entry;
			};
			await Promise.all([
				...missing.map(async (value) => {
					try {
						// an id with an initialData record is converted from it, any other loaded;
						// a conversion that fails is a failed load either way
						const record =
							initialData?.find(
								(record) => (record as Record<"id", string>).id === value,
							) ?? (await lookUp(value));
						newCache[value] = await convertSelected(value, record);
					} catch (e) {
						const entry = failedEntry(value, e);
						// if we should drop the record return here and don't create a record in cache
						if (entry) newCache[value] = entry;
					}
				}),
				...outdated.map(async (value) => {
					const origin = origins.current.get(selectedCache[value]);
					const reload = origin?.loadKey != null && origin.loadKey !== loadKey;
					try {
						// converted again from its record, unless it is loaded again
						const record =
							(!reload && recordsById.current.get(value)) ||
							(await lookUp(value));
						newCache[value] = await convertSelected(value, record);
					} catch (e) {
						const entry = failedEntry(value, e);
						if (entry) newCache[value] = entry;
						else droppedListed.push(value);
					}
				}),
			]);

			if (!mounted.current) return;

			// the ids onLoadError dropped leave the current selection, so a pick or removal
			// made while they loaded is kept; an id picked again meanwhile has a new entry and
			// stays
			const dropped = [...missing.filter(isIdNotInCache), ...droppedListed];
			const current = latest.current;
			const newSelection = current.selected.filter((id) => {
				if (!dropped.includes(id)) return true;
				const entry = current.selectedCache[id] as DataT | undefined;
				return (
					entry !== undefined &&
					!isLoadingPlaceholder(entry) &&
					entry !== selectedCache[id]
				);
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

			// the entries the dropped ids had when their lookup started
			const droppedEntries = droppedListed.map(
				(id) => [id, selectedCache[id]] as const,
			);
			setSelectedCache((oldCache) => {
				const nextCache: Record<string, DataT | MultiSelectorData> = {
					...oldCache,
				};
				Object.entries(newCache).forEach(([id, entry]) => {
					// an entry made with props that changed while it loaded does not replace
					// one made with the current props (it does replace "Loading…")
					const old = nextCache[id];
					if (
						old &&
						!isLoadingPlaceholder(old) &&
						isCurrent(old) &&
						!isCurrent(entry)
					)
						return;
					nextCache[id] = entry;
				});
				// a dropped entry is no longer listed, unless it was picked again meanwhile
				droppedEntries.forEach(([id, entry]) => {
					if (nextCache[id] === entry) delete nextCache[id];
				});
				return nextCache as Record<string, DataT>;
			});
			if (dropped.length > 0)
				setDroppedIds((oldDropped) => new Set([...oldDropped, ...dropped]));
			// an entry made with props that changed while it loaded is made again
			if (Object.values(newCache).some((entry) => !isCurrent(entry)))
				setRevision((oldRevision) => oldRevision + 1);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected, modelToSelectorData, loadKey, revision]);

	// stable identity: a new array on every render makes the selector reset its search
	const selectedData = useMemo(
		(): DataT[] =>
			selected
				// an id onLoadError dropped is left out until it has an entry: a pick from
				// the list, or a later lookup that loads or labels it
				.filter((value) => {
					if (!droppedIds.has(value)) return true;
					const entry = selectedCache[value] as DataT | undefined;
					return entry !== undefined && !isLoadingPlaceholder(entry);
				})
				.map(
					(value) =>
						selectedCache[value] ??
						(makeLoadingPlaceholder(
							value,
							t("backend-components.selector.loading"),
						) as DataT),
				),
		[selected, selectedCache, droppedIds, t],
	);

	return {
		selected: selectedData,
		handleSelect,
		loadError: selectedData.some(isSelectedLoadErrorEntry),
		convert,
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
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
		error,
		...otherProps
	} = props;
	const modelFetch = props.modelFetch ?? model;

	const { selected, handleSelect, loadError, convert } =
		useSelectedCache(props);

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
				options: await Promise.all(records.map(convert)),
				total: meta.filteredRows ?? meta.totalRows,
			};
		},
		[model, convert, searchResultLimit, sort, switchFilterName],
	);

	const handleLoadLruRecord = useCallback(
		async (id: string): Promise<DataT> => {
			const [data] = await modelFetch.getCached(id, {
				batch: !disableRequestBatching,
				dontReportNotFoundInBatch: true,
			});
			return convert(data);
		},
		[disableRequestBatching, modelFetch, convert],
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
			error={error || loadError}
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
