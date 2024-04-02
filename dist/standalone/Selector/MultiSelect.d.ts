import React from "react";
import { BaseSelectorData, BaseSelectorProps } from "./BaseSelector";
import { MultiSelectEntryProps } from "./MultiSelectEntry";
export interface MultiSelectorData extends BaseSelectorData {
    /**
     * Item click handler
     */
    onClick?: () => void;
    /**
     * Can the entry be unselected?
     * @param data The data entry to be unselected
     */
    canUnselect?: (data: MultiSelectorData, evt: React.MouseEvent<HTMLElement>) => boolean | Promise<boolean>;
    /**
     * Disable delete button
     */
    noDelete?: boolean;
}
export interface MultiSelectProps<DataT extends MultiSelectorData> extends Omit<BaseSelectorProps<DataT, false>, "onSelect" | "selected" | "classes"> {
    /**
     * Extended selection change handler
     * @param data The selected data entry/entries
     */
    onSelect?: (value: DataT[]) => void;
    /**
     * The currently selected values
     */
    selected: DataT[];
    /**
     * Specify a custom component for displaying multi select items
     */
    selectedEntryRenderer?: React.ComponentType<MultiSelectEntryProps<DataT>>;
    /**
     * CSS class for root
     */
    className?: string;
    /**
     * CSS classes to apply
     */
    classes?: Partial<Record<MultiSelectClassKey, string>>;
    /**
     * Sort function to perform a view-based sort on selected entries
     * @remarks This is a comparison function
     * @see Array.sort
     */
    selectedSort?: (a: DataT, b: DataT) => number;
    /**
     * Provide generic confirm remove/delete dialog when set to true.
     * @default false
     */
    confirmDelete?: boolean;
}
export interface MultiSelectSelectorOwnerState {
    selected: boolean;
}
export type MultiSelectClassKey = "root" | "selectedEntry" | "selector";
declare const _default: <DataT extends MultiSelectorData>(inProps: MultiSelectProps<DataT>) => React.JSX.Element;
export default _default;
