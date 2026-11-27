import React from "react";
import { BaseSelectorData, BaseSelectorProps, SelectorLruOptions } from "../../standalone";
import { ModelRecord, ModelUnknown } from "../../backend-integration/Model/Model";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";
import { DistributiveOmit } from "../../utils/distributiveOmit";
export type BackendSingleSelectLruOptions<DataT extends BaseSelectorData> = Omit<SelectorLruOptions<DataT>, "loadData">;
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
} & ({
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
} | {
    switchFilterName: string;
    /**
     * Label of the switch: its visible text and its accessible name.
     */
    switchLabel: React.ReactNode;
});
export type BackendSingleSelectProps<M extends ModelUnknown> = DistributiveOmit<BaseSelectorProps<BaseSelectorData, false>, "onLoad" | "selected" | "onSelect" | "lru" | "displaySwitch" | "switchLabel" | "defaultSwitchValue"> & BackendSingleSelectSwitchProps & {
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
    modelToSelectorData: (modelData: ModelRecord<M>) => Promise<BaseSelectorData> | BaseSelectorData;
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
export type BackendSingleSelectThemeProps = DistributiveOmit<BackendSingleSelectProps<ModelUnknown>, "model" | "modelFetch" | "modelToSelectorData" | "selected" | "onSelect" | "initialData" | "lru" | "selectedFreeSolo" | "onSelectFreeSolo">;
declare const BackendSingleSelect: <M extends ModelUnknown>(inProps: BackendSingleSelectProps<M>) => React.JSX.Element;
declare const _default: typeof BackendSingleSelect;
export default _default;
