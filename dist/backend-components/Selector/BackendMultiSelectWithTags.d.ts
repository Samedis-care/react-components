import React from "react";
import { BaseSelectorData, MultiSelectorData, MultiSelectWithTagsProps } from "../../standalone";
import { ModelGetResponse, ModelRecord, ModelUnknown } from "../../backend-integration";
import { BackendMultiSelectLruOptions } from "./BackendMultiSelect";
import { DataGridSortSetting } from "../../standalone/DataGrid/DataGrid";
import { BackendSingleSelectLruOptions } from "./BackendSingleSelect";
export interface BackendMultiSelectWithTagsProps<GroupModelT extends ModelUnknown, DataModelT extends ModelUnknown, GroupDataT extends BaseSelectorData, DataDataT extends MultiSelectorData> extends Omit<MultiSelectWithTagsProps<DataDataT, GroupDataT>, "loadGroupEntries" | "loadDataOptions" | "loadGroupOptions" | "displaySwitch" | "selected" | "onChange" | "lruGroup" | "lruData"> {
    /**
     * The selected data record IDs
     */
    selected: string[];
    /**
     * Change event callback
     * @param selected The now selected IDs
     */
    onChange?: (selected: string[], raw: DataDataT[]) => void;
    /**
     * Initial data (model format) used for selected cache
     */
    initialData?: ModelRecord<DataModelT>[];
    /**
     * The data source for groups
     */
    groupModel: GroupModelT;
    /**
     * Callback that converts a model entry to a base selector entry
     * @param data The record data (overview)
     * @returns Selector data
     * @remarks Selector data value must be set to ID
     */
    convGroup: (data: ModelRecord<GroupModelT>) => Promise<GroupDataT> | GroupDataT;
    /**
     * Callback that gets the group entries for a given group record
     * @param data The record data (detailed)
     * @returns Data selector entries
     * @remarks Selector data value must be set to ID of data record
     */
    getGroupDataEntries: (data: ModelGetResponse<GroupModelT>) => Promise<DataDataT[]> | DataDataT[];
    /**
     * The data source for data entries
     */
    dataModel: DataModelT;
    /**
     * Callback that converts a model entry to a multi selector entry
     * @param data The record data (overview)
     * @returns Selector data
     * @remarks Selector data value must be set to ID
     */
    convData: (data: ModelRecord<DataModelT>) => Promise<DataDataT> | DataDataT;
    /**
     * Name of the switch filter for groups or undefined if disabled
     */
    switchFilterNameGroup?: string;
    /**
     * Name of the switch filter for data or undefined if disabled
     */
    switchFilterNameData?: string;
    /**
     * The debounce time in ms to wait for group searches
     * @default 500
     */
    groupSearchDebounceTime?: number;
    /**
     * The debounce time in ms to wait for data searches
     * @default 500
     */
    dataSearchDebounceTime?: number;
    /**
     * Sort settings for Groups
     */
    groupSort?: DataGridSortSetting[];
    /**
     * Sort settings for Data
     */
    dataSort?: DataGridSortSetting[];
    /**
     * LRU options for group selector
     */
    lruGroup?: BackendSingleSelectLruOptions<GroupDataT>;
    /**
     * LRU options for data selector
     */
    lruData?: BackendMultiSelectLruOptions<DataDataT>;
}
/**
 * Themable subset of BackendMultiSelectWithTagsProps (used for theme defaultProps)
 * @remarks Excludes the props which are specific to a single instance (models, selection, callbacks)
 */
export type BackendMultiSelectWithTagsThemeProps = Omit<BackendMultiSelectWithTagsProps<ModelUnknown, ModelUnknown, BaseSelectorData, MultiSelectorData>, "groupModel" | "dataModel" | "convGroup" | "convData" | "getGroupDataEntries" | "selected" | "onChange" | "initialData" | "lruGroup" | "lruData">;
/**
 * Backend connected MultiSelectWithTags
 * @remarks Doesn't support custom data
 * @constructor
 */
declare const BackendMultiSelectWithTags: <GroupModelT extends ModelUnknown, DataModelT extends ModelUnknown, GroupDataT extends BaseSelectorData, DataDataT extends MultiSelectorData>(inProps: BackendMultiSelectWithTagsProps<GroupModelT, DataModelT, GroupDataT, DataDataT>) => React.JSX.Element;
declare const _default: typeof BackendMultiSelectWithTags;
export default _default;
