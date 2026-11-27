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

export type BackendSingleSelectLruOptions<DataT extends BaseSelectorData> =
	Omit<SelectorLruOptions<DataT>, "loadData">;

/**
 * The switch of a backend single select. `switchLabel` is required while a
 * `switchFilterName` shows the switch: the visible label is its accessible name.
 */
export type BackendSingleSelectSwitchProps = {
	/**
	 * Whether the switch is on when it appears: when the field mounts with
	 * `switchFilterName`, and each time `switchFilterName` is set after none. Changes
	 * while the switch is shown are ignored; from then on the user sets it. Removing
	 * `switchFilterName` turns the switch off.
	 * @default false
	 */
	defaultSwitchValue?: boolean;
} & (
	| {
			/**
			 * Name of the filter a switch above the field sets, e.g. `"include_inactive"` for a
			 * "Show inactive" switch. With it the field shows the switch, and every search sends
			 * `additionalFilters: { [switchFilterName]: true }` to `model.index` while the switch
			 * is on (`false` while it is off), so toggling it reloads the options. A new name
			 * applies from the next search.
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
			switchFilterName: string;
			/**
			 * Label of the switch: its visible text and its accessible name.
			 */
			switchLabel: React.ReactNode;
	  }
);

export type BackendSingleSelectProps<M extends ModelUnknown> = DistributiveOmit<
	BaseSelectorProps<BaseSelectorData, false>,
	| "onLoad"
	| "selected"
	| "onSelect"
	| "lru"
	| "displaySwitch"
	| "switchLabel"
	| "defaultSwitchValue"
> &
	BackendSingleSelectSwitchProps & {
		/**
		 * The model to use
		 */
		model: M;
		/**
		 * The model to use for fetch requests (to enable request batching)
		 * @remarks One with other react-query keys than the previous one (another model id
		 *          or cache keys) loads the shown record again through it. A new instance
		 *          of the same model (same keys) does not: it loads the same records.
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
		 * @remarks A new function converts the shown entry again from its record, without a
		 *          request (labels built with `t` follow a language switch). Pass a stable
		 *          one (module level, or useCallback/useMemo on what it reads): a new one on
		 *          every render converts the shown entry on every render.
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
		 * The id of the selected record, or null (undefined counts as null). Shown without a
		 * request from the entry just picked in the field (from the list, or the one
		 * `onAddNew` created), a matching `additionalOptions` entry or an `initialData`
		 * record, otherwise loaded through `modelFetch`. Until the record of this id is there,
		 * the field shows the translated "Loading…" (`backend-components.selector.loading`), never
		 * the record of an earlier id, and a lookup of an earlier id that finishes later is
		 * discarded (also its error: no `onLoadError`, no `onSelect(null)`). An id
		 * `onLoadError` dropped is not shown, also while `selected` keeps it: the field is
		 * empty instead. Not shown while `selectedFreeSolo` is a non-empty string.
		 *
		 * The shown entry follows the props: a new `modelToSelectorData` converts it again
		 * from the record the field listed or loaded for the id, without a request (an
		 * `additionalOptions` entry, and one `onAddNew` returned for a record the field has
		 * not listed, are shown as they are); a `modelFetch` with other react-query keys or
		 * a new `refreshToken` loads it again through `modelFetch.getCached` (not an
		 * `additionalOptions` entry), so an app that changed the record invalidates the
		 * model's queries before it changes `refreshToken`. The field keeps showing the
		 * entry meanwhile.
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
		 * @return null To remove the entry: `onSelect(null)`, unless `selected` changed
		 *         meanwhile (a pick, a clear) or the field has unmounted. The field is then
		 *         empty, also while `selected` keeps the id (without `onSelect`, or a parent
		 *         that does not apply `null`).
		 * @remarks Without it, the entry is labelled "Unknown entry" if the backend did not
		 *          return its record, else "Error while fetching data". While an entry
		 *          that failed to load is shown, with either label, the field is marked as
		 *          erroneous (`error`, so `aria-invalid="true"`).
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
	};

/**
 * Themable subset of BackendSingleSelectProps (used for theme defaultProps)
 * @remarks Excludes the props which are specific to a single instance (model, selection, callbacks)
 */
export type BackendSingleSelectThemeProps = DistributiveOmit<
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

/**
 * The entry BackendSingleSelect shows for an id, and what it was made with
 */
interface ShownEntry<M extends ModelUnknown> {
	/**
	 * The entry
	 */
	entry: BaseSelectorData;
	/**
	 * The modelToSelectorData that converted it from the id's record. Null for an entry not
	 * converted from a record (an additionalOptions entry, one that failed to load, one
	 * onAddNew returned for a record the field has not listed): a new modelToSelectorData
	 * leaves it as it is.
	 */
	convertedBy: BackendSingleSelectProps<M>["modelToSelectorData"] | null;
	/**
	 * The load key (getSelectedLoadKey) when it was made: another one loads the entry again.
	 * Null for an additionalOptions entry, which is never loaded.
	 */
	loadKey: string | null;
}

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
		switchFilterName,
		lru,
		onLoadError,
		additionalOptions,
		disableRequestBatching,
		freeSolo,
		selectedFreeSolo,
		onSelectFreeSolo,
		error,
		refreshToken,
		...otherProps
	} = props;
	const modelFetch = modelFetchProp ?? model;
	const loadKey = getSelectedLoadKey(
		modelFetch,
		!disableRequestBatching,
		refreshToken,
	);

	if (freeSolo && !onSelectFreeSolo)
		throw new Error("freeSolo enabled, but no onSelectFreeSolo callback");

	// the entry picked from the list last, shown for its id until the effect below
	// has taken it into the cache, so a pick does not show "Loading…" in between
	const [picked, setPicked] = useState<BaseSelectorData | null>(null);
	const [selectedCache, setSelectedCache] = useState<ShownEntry<M> | null>(
		null,
	);
	// the record of each id this field listed, loaded or converted, by id: a new
	// modelToSelectorData converts the shown entry again from it, without a request
	const recordsById = useRef(new Map<string, ModelRecord<M>>());
	// the id and load key the effect below last ran for: an id onLoadError dropped is
	// looked up again for a new id or load key, not for a new modelToSelectorData
	const lastRun = useRef<{ selected: string | null; loadKey: string } | null>(
		null,
	);
	// the ids onLoadError dropped: while one is selected without an entry, the field is
	// empty, also when the parent keeps it (no onSelect, or one that does not apply null)
	const [droppedIds, setDroppedIds] = useState<ReadonlySet<string>>(
		() => new Set(),
	);

	const { t } = useCCTranslations();

	// converts a record for the list (an option, an LRU entry) and keeps the record, so a
	// pick of its entry can be converted again
	const convert = useCallback(
		async (record: ModelRecord<M>): Promise<BaseSelectorData> => {
			const entry = await modelToSelectorData(record);
			recordsById.current.set(entry.value, record);
			return entry;
		},
		[modelToSelectorData],
	);

	const handleLoad = useCallback(
		async (
			search: string,
			switchValue: boolean,
		): Promise<BaseSelectorLoadResult<BaseSelectorData>> => {
			const [records, meta] = await model.index({
				page: 1,
				rows: searchResultLimit ?? 25,
				sort: sort,
				quickFilter: search,
				additionalFilters: switchFilterName
					? { [switchFilterName]: switchValue }
					: undefined,
			});
			return {
				options: await Promise.all(records.map(convert)),
				total: meta.filteredRows ?? meta.totalRows,
			};
		},
		[model, searchResultLimit, sort, switchFilterName, convert],
	);

	const handleLoadLruRecord = useCallback(
		async (id: string): Promise<BaseSelectorData> => {
			const [data] = await modelFetch.getCached(id, {
				batch: !disableRequestBatching,
				dontReportNotFoundInBatch: true,
			});
			return convert(data);
		},
		[modelFetch, convert, disableRequestBatching],
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

	// the entry of selected: taken or loaded once per id, converted again by a new
	// modelToSelectorData and loaded again for a new load key
	useEffect(() => {
		const retryDropped =
			lastRun.current?.selected !== selected ||
			lastRun.current.loadKey !== loadKey;
		lastRun.current = { selected, loadKey };
		if (selected == null) return;
		const cached =
			selectedCache?.entry.value === selected ? selectedCache : null;
		// a modelFetch with other keys or a new refreshToken loads the shown entry again,
		// unless it is an additionalOptions entry
		const reload =
			cached !== null && cached.loadKey !== null && cached.loadKey !== loadKey;
		if (cached) {
			// a new modelToSelectorData converts it again, if it was converted from a record
			const reconvert =
				cached.convertedBy !== null &&
				cached.convertedBy !== modelToSelectorData;
			if (!reload && !reconvert) return;
		} else {
			// no need to fetch additional options
			const additionalOption = additionalOptions?.find(
				(opt) => opt.value === selected,
			);
			if (additionalOption) {
				setSelectedCache({
					entry: additionalOption,
					convertedBy: null,
					loadKey: null,
				});
				return;
			}

			// a pick from the list (or the entry onAddNew created) is shown as picked, without
			// looking it up again; one from the list was converted from a record listed here
			if (picked && picked.value === selected) {
				setSelectedCache({
					entry: picked,
					convertedBy: recordsById.current.has(selected)
						? modelToSelectorData
						: null,
					loadKey,
				});
				setPicked(null);
				return;
			}

			if (droppedIds.has(selected) && !retryDropped) return;
		}

		// set when selected, modelToSelectorData or the load key change again, or the field
		// unmounts: what is loaded for this id then is discarded, so it can neither replace
		// the entry of the new id or a newer one of this id, nor drop it
		let discarded = false;
		void (async () => {
			let record: ModelRecord<M> | undefined;
			let newEntry: BaseSelectorData | null = null;
			if (cached) {
				// converted again from its record, unless it is loaded again
				if (!reload) record = recordsById.current.get(selected);
			} else if (initialData) {
				// process initial data
				record = initialData.find(
					(record) => record["id" as keyof typeof record] === selected,
				);
				if (record) {
					newEntry = await modelToSelectorData(record);
				}
			}

			if (!newEntry || !record) {
				try {
					record ??= (
						await modelFetch.getCached(selected, {
							batch: !disableRequestBatching,
						})
					)[0];
					newEntry = await modelToSelectorData(record);
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
						// unselect it, and stop showing the entry it had
						setDroppedIds((oldDropped) => new Set(oldDropped).add(selected));
						if (cached) setSelectedCache(null);
						if (onSelect) onSelect(null);
						return;
					}
					setSelectedCache({
						entry: makeSelectedLoadErrorEntry(selected, label),
						convertedBy: null,
						loadKey,
					});
					return;
				}
			}
			if (discarded) return;
			recordsById.current.set(selected, record);
			// the entry of the new id replaces the previous one: a field the new entry
			// leaves out (titleTooltip, icon, …) must not keep the previous record's value
			setSelectedCache({
				entry: newEntry,
				convertedBy: modelToSelectorData,
				loadKey,
			});
		})();
		return () => {
			discarded = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected, modelToSelectorData, loadKey]);

	// the entry of selected: the cached one only while it is this id's, else one that
	// is known without loading it (just picked, or an additionalOptions entry; the
	// effect above caches it), else null while it loads (shown as "Loading…") or after
	// onLoadError dropped it (shown as an empty field)
	const selectedEntry =
		selected == null
			? null
			: selectedCache?.entry.value === selected
				? selectedCache.entry
				: picked?.value === selected
					? picked
					: (additionalOptions?.find((opt) => opt.value === selected) ?? null);

	// the entry of a record that failed to load names no record: the field is in error
	// while it is shown
	const loadError =
		!selectedFreeSolo &&
		selectedEntry != null &&
		isSelectedLoadErrorEntry(selectedEntry);

	const debouncedLoad = useDebouncedLoad(handleLoad, searchDebounceTime ?? 500);

	return (
		<SingleSelect
			{...otherProps}
			error={error || loadError}
			freeSolo={freeSolo}
			onLoad={debouncedLoad}
			{...(switchFilterName
				? { displaySwitch: true as const, switchLabel: props.switchLabel }
				: { displaySwitch: false as const })}
			additionalOptions={additionalOptions}
			refreshToken={refreshToken}
			onSelect={handleSelect}
			selected={
				selectedFreeSolo
					? { value: selectedFreeSolo, label: selectedFreeSolo, freeSolo: true }
					: selected != null && !droppedIds.has(selected)
						? (selectedEntry ?? {
								value: selected,
								label: t("backend-components.selector.loading"),
							})
						: selectedEntry
			}
			lru={lruConfig}
		/>
	);
};

export default React.memo(BackendSingleSelect) as typeof BackendSingleSelect;
