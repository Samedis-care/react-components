import React from "react";
import { MultiSelectProps, MultiSelectorData, SelectorLruOptions } from "../../standalone";
import { ModelRecord, ModelUnknown } from "../../backend-integration/Model/Model";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";
import { DistributiveOmit } from "../../utils/distributiveOmit";
export type BackendMultiSelectLruOptions<DataT extends MultiSelectorData> = Omit<SelectorLruOptions<DataT>, "loadData">;
/**
 * The switch of a backend multi select. `switchLabel` is required while a
 * `switchFilterName` shows the switch: the visible label is its accessible name.
 */
export type BackendMultiSelectSwitchProps = {
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
} | {
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
export type BackendMultiSelectProps<M extends ModelUnknown, DataT extends MultiSelectorData> = DistributiveOmit<MultiSelectProps<DataT>, "onLoad" | "selected" | "onSelect" | "lru" | "displaySwitch" | "switchLabel"> & BackendMultiSelectSwitchProps & {
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
interface UseSelectedCacheResult<M extends ModelUnknown, DataT extends MultiSelectorData> {
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
export declare const useSelectedCache: <M extends ModelUnknown, DataT extends MultiSelectorData>(props: Pick<BackendMultiSelectProps<M, DataT>, "model" | "modelFetch" | "disableRequestBatching" | "modelToSelectorData" | "onSelect" | "selected" | "initialData" | "onLoadError" | "additionalOptions" | "refreshToken">) => UseSelectedCacheResult<M, DataT>;
/**
 * Themable subset of BackendMultiSelectProps (used for theme defaultProps)
 * @remarks Excludes the props which are specific to a single instance (model, selection, callbacks)
 */
export type BackendMultiSelectThemeProps = DistributiveOmit<BackendMultiSelectProps<ModelUnknown, MultiSelectorData>, "model" | "modelFetch" | "modelToSelectorData" | "selected" | "onSelect" | "initialData" | "lru">;
/**
 * Backend connected MultiSelect
 * @remarks Doesn't support custom data
 * @constructor
 */
declare const BackendMultiSelect: <M extends ModelUnknown, DataT extends MultiSelectorData>(inProps: BackendMultiSelectProps<M, DataT>) => React.JSX.Element;
declare const _default: typeof BackendMultiSelect;
export default _default;
