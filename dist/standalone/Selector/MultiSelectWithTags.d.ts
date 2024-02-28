import React from "react";
import { BaseSelectorProps, MultiSelectorData, SelectorLruOptions } from "../../standalone/Selector";
import { MultiSelectWithoutGroupProps } from "./MultiSelectWithoutGroup";
import { BaseSelectorData } from "./BaseSelector";
export interface MultiSelectWithTagsProps<DataT extends MultiSelectorData, GroupT extends BaseSelectorData> extends Pick<BaseSelectorProps<GroupT>, "disabled" | "noOptionsText" | "loadingText" | "closeText" | "openText" | "displaySwitch" | "defaultSwitchValue" | "switchLabel">, Omit<MultiSelectWithoutGroupProps<DataT>, "classes" | "onChange" | "dataOptions" | "setDataOptions" | "label"> {
    /**
     * The title of control
     */
    title: string;
    /**
     * Label above search bar
     */
    searchInputLabel?: string;
    /**
     * Custom styles for multi select without groups
     */
    subClasses?: {
        dataSelector: MultiSelectWithoutGroupProps<DataT>["classes"];
    };
    /**
     * Change event callback
     * @param data The currently selected entries. This should be feed back to selected prop
     */
    onChange?: (data: DataT[]) => void;
    /**
     * Callback which loads the data entries for the given group
     * @param group The group which was selected
     * @returns The data entries to add for this group
     */
    loadGroupEntries: (group: GroupT) => DataT[] | Promise<DataT[]>;
    /**
     * Search callback which is called to load available data entries
     * @param query The search string
     * @param switchValue The value of the switch or false if switch is disabled
     */
    loadDataOptions: (query: string, switchValue: boolean) => DataT[] | Promise<DataT[]>;
    /**
     * Search callback which is called to load available group entries
     * @param query The search string
     * @param switchValue The value of the switch or false if switch is disabled
     */
    loadGroupOptions: (query: string, switchValue: boolean) => GroupT[] | Promise<GroupT[]>;
    /**
     * LRU options for group
     */
    lruGroup?: SelectorLruOptions<GroupT>;
    /**
     * LRU options for data
     */
    lruData?: SelectorLruOptions<DataT>;
}
declare const _default: <DataT extends MultiSelectorData, GroupT extends BaseSelectorData>(props: MultiSelectWithTagsProps<DataT, GroupT>) => React.JSX.Element;
export default _default;
