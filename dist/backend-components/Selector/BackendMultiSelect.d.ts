import React from "react";
import { MultiSelectProps, MultiSelectorData, SelectorLruOptions } from "../../standalone";
import Model, { ModelFieldName, PageVisibility } from "../../backend-integration/Model/Model";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";
export type BackendMultiSelectLruOptions<DataT extends MultiSelectorData> = Omit<SelectorLruOptions<DataT>, "loadData">;
export interface BackendMultiSelectProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData> extends Omit<MultiSelectProps<DataT>, "onLoad" | "selected" | "onSelect" | "lru"> {
    /**
     * The model to use
     */
    model: Model<KeyT, VisibilityT, CustomT>;
    /**
     * The model to use for fetch requests (to enable request batching)
     */
    modelFetch?: Model<KeyT, VisibilityT, CustomT>;
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
     */
    modelToSelectorData: (modelData: Record<string, unknown>) => Promise<DataT> | DataT;
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
    initialData?: Record<string, unknown>[];
    /**
     * Sort settings
     */
    sort?: DataGridSortSetting[];
    /**
     * Name of the switch filter or undefined if disabled
     */
    switchFilterName?: string;
    /**
     * LRU config
     */
    lru?: BackendMultiSelectLruOptions<DataT>;
    /**
     * Load error event
     * @param error The error that has been raised while loading
     * @return string Label for entry which failed loading
     * @return null To remove entry from selected entries
     */
    onLoadError?: (error: Error) => string | null;
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
export declare const useSelectedCache: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData>(props: Pick<BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>, "model" | "modelFetch" | "disableRequestBatching" | "modelToSelectorData" | "onSelect" | "selected" | "initialData" | "onLoadError">) => UseSelectedCacheResult<DataT>;
/**
 * Backend connected MultiSelect
 * @remarks Doesn't support custom data
 * @constructor
 */
declare const BackendMultiSelect: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData>(props: BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>) => React.JSX.Element;
declare const _default: typeof BackendMultiSelect;
export default _default;
