import React from "react";
import { BaseSelectorData, BaseSelectorProps } from "./BaseSelector";
import { IMultiSelectEntryProps } from "./MultiSelectEntry";
import { ClassNameMap } from "@mui/styles/withStyles";
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
    selectedEntryRenderer?: React.ComponentType<IMultiSelectEntryProps<DataT>>;
    /**
     * CSS classes to apply
     */
    classes?: Partial<ClassNameMap<keyof ReturnType<typeof useMultiSelectorStyles>>>;
    /**
     * Custom classes passed to subcomponents
     */
    subClasses?: {
        baseSelector: BaseSelectorProps<BaseSelectorData, false>["classes"];
    };
    /**
     * Sort function to perform a view-based sort on selected entries
     * @remarks This is a comparison function
     * @see Array.sort
     */
    selectedSort?: (a: DataT, b: DataT) => number;
    /**
     * Provide generic confirm remove/delete dialog when set to true.
     * Defaults to MultiSelectTheme.confirmDeleteDefault, which defaults to false
     */
    confirmDelete?: boolean;
}
declare const useMultiSelectorStyles: (props?: any) => ClassNameMap<"selectedEntries">;
export interface MultiSelectTheme {
    /**
     * default value for confirm delete, default false
     */
    confirmDeleteDefault?: boolean;
}
declare const _default: <DataT extends MultiSelectorData>(props: MultiSelectProps<DataT>) => React.JSX.Element;
export default _default;
