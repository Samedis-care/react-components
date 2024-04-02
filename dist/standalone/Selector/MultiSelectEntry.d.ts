import React from "react";
import { MultiSelectorData } from "./MultiSelect";
export interface MultiSelectEntryProps<DataT extends MultiSelectorData> {
    /**
     * Should we show icons?
     */
    enableIcons?: boolean;
    /**
     * The size of the icons
     */
    iconSize?: number;
    /**
     * Should we render a divider below
     */
    enableDivider: boolean;
    /**
     * Delete handler (if undefined hide/disable delete button)
     * @param evt
     */
    handleDelete?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
    /**
     * The data entry to render
     */
    data: DataT;
    /**
     * Sets the data for this entry
     * @remarks The data.value identifies the entry to be changed
     */
    setData: (newValue: DataT) => void;
    /**
     * Custom CSS class to apply to root
     */
    className?: string;
    /**
     * Custom CSS classes
     */
    classes?: Partial<Record<MultiSelectEntryClassKey, string>>;
}
export interface MultiSelectEntrySelectedOwnerState {
    unClickable: boolean;
    ignore: boolean;
}
export interface MultiSelectEntryImageOwnerState {
    iconSize?: number;
}
export type MultiSelectEntryClassKey = "root" | "selected" | "label" | "icon" | "iconSvg" | "divider" | "image";
declare const _default: <DataT extends MultiSelectorData>(inProps: MultiSelectEntryProps<DataT>) => React.JSX.Element;
export default _default;
