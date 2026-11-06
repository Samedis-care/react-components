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
export interface MultiSelectProps<DataT extends MultiSelectorData> extends Omit<BaseSelectorProps<DataT, false>, "multiple" | "onSelect" | "selected" | "classes"> {
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
     * Specify a custom component for displaying multi select items. The entries
     * are the items of one list (`<ul>`), so its root must be an `<li>`, e.g.
     * MUI's ListItem, as MultiSelectEntry renders.
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
     * Comparison function (as for Array.sort) for the order in which the
     * selected entries are listed. It sorts a copy for display only: `selected`
     * is not changed (it may be frozen), and `onSelect` reports the entries in
     * `selected`'s order. Without it the entries are listed in `selected`'s
     * order.
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
declare const MultiSelect: <DataT extends MultiSelectorData>(inProps: MultiSelectProps<DataT>) => React.JSX.Element;
declare const _default: typeof MultiSelect;
export default _default;
