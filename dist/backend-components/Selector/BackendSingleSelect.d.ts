import React from "react";
import { BaseSelectorData, BaseSelectorProps, SelectorLruOptions } from "../../standalone";
import { ModelRecord, ModelUnknown } from "../../backend-integration/Model/Model";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";
export type BackendSingleSelectLruOptions<DataT extends BaseSelectorData> = Omit<SelectorLruOptions<DataT>, "loadData">;
export interface BackendSingleSelectProps<M extends ModelUnknown> extends Omit<BaseSelectorProps<BaseSelectorData, false>, "onLoad" | "selected" | "onSelect" | "lru"> {
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
export type BackendSingleSelectThemeProps = Omit<BackendSingleSelectProps<ModelUnknown>, "model" | "modelFetch" | "modelToSelectorData" | "selected" | "onSelect" | "initialData" | "lru" | "selectedFreeSolo" | "onSelectFreeSolo">;
declare const BackendSingleSelect: <M extends ModelUnknown>(inProps: BackendSingleSelectProps<M>) => React.JSX.Element;
declare const _default: typeof BackendSingleSelect;
export default _default;
