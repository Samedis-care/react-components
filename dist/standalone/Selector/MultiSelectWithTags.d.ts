import React from "react";
import { MultiSelectWithoutGroupProps } from "./MultiSelectWithoutGroup";
import { BaseSelectorData, BaseSelectorLoadHandler, BaseSelectorProps, SelectorLruOptions } from "./BaseSelector";
import { MultiSelectorData } from "./MultiSelect";
export interface MultiSelectWithTagsProps<DataT extends MultiSelectorData, GroupT extends BaseSelectorData> extends Pick<BaseSelectorProps<GroupT, false>, "disabled" | "noOptionsText" | "loadingText" | "closeText" | "openText" | "displaySwitch" | "defaultSwitchValue" | "switchLabel" | "forceQuery" | "startTypingToSearchText">, Omit<MultiSelectWithoutGroupProps<DataT>, "additionalOptions" | "classes" | "onChange" | "dataOptions" | "setDataOptions" | "label"> {
    /**
     * Title of the control, shown above both fields; names the group they form
     * for assistive technology
     */
    title: string;
    /**
     * Does the selection differ from the server-side value?
     * @remarks Presentational only; set by the form engine from `RenderParams.dirty`.
     */
    dirty?: boolean;
    /**
     * Focus the group selector, the first input, when the control mounts
     */
    autoFocus?: boolean;
    /**
     * Label above search bar
     */
    searchInputLabel?: string;
    /**
     * Accessible name of the group field, the field whose pick adds all
     * entries of a group. Read by screen readers, not shown. An empty string
     * uses the default as well.
     * @default "Add all entries of a group", translated
     */
    groupInputLabel?: string;
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
     * @remarks While they load, the control is busy (`aria-busy`) and the group
     * field is read-only: it keeps focus, but nothing can be typed or picked.
     * @param group The group which was selected
     * @returns The data entries to add for this group
     */
    loadGroupEntries: (group: GroupT) => DataT[] | Promise<DataT[]>;
    /**
     * Search callback which is called to load available data entries
     */
    loadDataOptions: BaseSelectorLoadHandler<DataT>;
    /**
     * Search callback which is called to load available group entries
     */
    loadGroupOptions: BaseSelectorLoadHandler<GroupT>;
    /**
     * LRU options for group
     */
    lruGroup?: SelectorLruOptions<GroupT>;
    /**
     * LRU options for data
     */
    lruData?: SelectorLruOptions<DataT>;
    /**
     * custom CSS class to apply to root
     */
    className?: string;
    /**
     * Custom CSS classes
     */
    classes?: Partial<Record<MultiSelectWithTagsClassKey, string>>;
}
/**
 * Slots of MultiSelectWithTags (theme `CcMultiSelectWithTags`, `classes`):
 * - `root`: the outer element, a group named by the title
 * - `loadOverlay`: the overlay shown while a group's entries load
 * - `groupInputLabel`: the visually hidden label of the group field
 */
export type MultiSelectWithTagsClassKey = "root" | "loadOverlay" | "groupInputLabel";
declare const MultiSelectWithTags: <DataT extends MultiSelectorData, GroupT extends BaseSelectorData>(inProps: MultiSelectWithTagsProps<DataT, GroupT>) => React.JSX.Element;
declare const _default: typeof MultiSelectWithTags;
export default _default;
