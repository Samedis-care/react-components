import React from "react";
import { BaseSelectorData, BaseSelectorProps, SelectorLruOptions } from "../../standalone";
import Model, { ModelFieldName, PageVisibility } from "../../backend-integration/Model/Model";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";
export type BackendSingleSelectLruOptions<DataT extends BaseSelectorData> = Omit<SelectorLruOptions<DataT>, "loadData">;
export interface BackendSingleSelectProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> extends Omit<BaseSelectorProps<BaseSelectorData>, "onLoad" | "selected" | "onSelect" | "lru"> {
    /**
     * The model to use
     */
    model: Model<KeyT, VisibilityT, CustomT>;
    /**
     * The model to use for fetch requests (to enable request batching)
     */
    modelFetch?: Model<KeyT, VisibilityT, CustomT>;
    /**
     * The debounce time for search in ms
     * @default 500
     */
    searchDebounceTime?: number;
    /**
     * Callback that converts the model data to the actual data displayed in the selector
     * @param modelData The model data
     */
    modelToSelectorData: (modelData: Record<string, unknown>) => Promise<BaseSelectorData> | BaseSelectorData;
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
    initialData?: Record<string, unknown>[];
    /**
     * LRU settings
     */
    lru?: BackendSingleSelectLruOptions<BaseSelectorData>;
    /**
     * Load error event
     * @param error The error that has been raised while loading
     * @return string Label for entry which failed loading
     * @return null To remove entry from selected entries
     */
    onLoadError?: (error: Error) => string | null;
    /**
     * Additional options to choose from (not provided by backend).
     * @remarks Has no effect if LRU. Will be shown at the top of the list
     */
    additionalOptions?: BaseSelectorData[];
    /**
     * Disable request batching
     */
    disableRequestBatching?: boolean;
}
declare const _default: <KeyT extends string, VisibilityT extends PageVisibility, CustomT>(props: BackendSingleSelectProps<KeyT, VisibilityT, CustomT>) => React.JSX.Element;
export default _default;
