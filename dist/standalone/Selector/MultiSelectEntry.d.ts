import React from "react";
import { MultiSelectorData } from "./MultiSelect";
import { ClassNameMap } from "@mui/styles/withStyles";
export interface IMultiSelectEntryProps<DataT extends MultiSelectorData> {
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
}
declare const _default: <DataT extends MultiSelectorData>(props: IMultiSelectEntryProps<DataT> & {
    classes?: ClassNameMap<"label" | "image" | "selected" | "root" | "container" | "icon" | "divider" | "unClickable" | "ignored" | "iconSvg"> | undefined;
}) => React.JSX.Element;
export default _default;
