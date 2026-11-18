import React from "react";
import { MultiSelectorData } from "./MultiSelect";
/**
 * A selected entry's change that is not saved yet: "added" to the selection, or "removed"
 * from it
 */
export type MultiSelectChangeState = "added" | "removed";
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
     * The entry's change that is not saved yet, if any
     * @remarks Shown as a text after the label ("Added", "Removed"), not by colour alone. A
     *          removed entry's label is struck through, and instead of the remove button it
     *          has a restore button (handleRestore).
     * @default undefined (no pending change)
     */
    changeState?: MultiSelectChangeState;
    /**
     * Restore handler of a removed entry (changeState "removed"): its restore button, named
     * "Restore <label>", takes the place of the remove button. Without it the removed entry
     * has no button.
     * @param evt The click on the restore button, whose `name` is the entry's value
     */
    handleRestore?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
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
export type MultiSelectEntryClassKey = "root" | "selected" | "label" | "changeState" | "icon" | "iconSvg" | "restoreIconSvg" | "divider" | "image";
/**
 * One selected entry of MultiSelect, rendered as a list item (`<li>`, the
 * `root` slot) of the list of selected entries: the row (`selected`) with the
 * optional icon, the label and the text of a change that is not saved yet
 * (`changeState`), and beside it the remove button (`icon`) when `handleDelete`
 * is set, or for a removed entry the restore button when `handleRestore` is set.
 * With `data.onClick` the row is a button, otherwise plain text.
 */
declare const MultiSelectEntry: <DataT extends MultiSelectorData>(inProps: MultiSelectEntryProps<DataT>) => React.JSX.Element;
declare const _default: typeof MultiSelectEntry;
export default _default;
