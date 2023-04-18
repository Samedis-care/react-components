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
    canUnselect?: (data: MultiSelectorData) => boolean | Promise<boolean>;
    /**
     * Disable delete button
     */
    noDelete?: boolean;
}
export interface MultiSelectProps<DataT extends MultiSelectorData> extends Omit<BaseSelectorProps<DataT>, "onSelect" | "selected" | "classes"> {
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
        baseSelector: BaseSelectorProps<BaseSelectorData>["classes"];
    };
    /**
     * Sort function to perform a view-based sort on selected entries
     * @remarks This is a comparison function
     * @see Array.sort
     */
    selectedSort?: (a: DataT, b: DataT) => number;
}
declare const useMultiSelectorStyles: (props?: any) => ClassNameMap<"selectedEntries">;
declare const _default: <DataT extends MultiSelectorData>(props: MultiSelectProps<DataT>) => JSX.Element;
export default _default;
