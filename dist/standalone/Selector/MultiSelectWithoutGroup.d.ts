import React from "react";
import { BaseSelectorProps, MultiSelectorData } from "../../standalone/Selector";
import { BaseSelectorLoadHandler } from "./BaseSelector";
import { DistributiveOmit } from "../../utils/internal/distributiveOmit";
export type MultiSelectWithoutGroupProps<DataT extends MultiSelectorData> = DistributiveOmit<BaseSelectorProps<DataT, false>, "onSelect" | "selected" | "classes" | "onLoad"> & {
    /**
     * Extended selection change handler
     * @param data The selected data entry/entries
     */
    onSelect?: (value: DataT[]) => void;
    /**
     * Custom styles
     */
    classes?: Partial<Record<MultiSelectWithoutGroupClassKey, string>>;
    /**
     * The currently selected values
     */
    selected: DataT[];
    /**
     * The values of the entries in `selected` that were added but are not saved yet: each
     * of their chips is marked "Added"
     * @default none
     */
    added?: string[];
    /**
     * Entries that were removed from the selection but are not saved yet. Their chips
     * follow the selected ones (sorted together with them by `sortCompareFn`), the label
     * struck through and marked "Removed", with a restore button where a chip's remove
     * button is: restoring one calls `onSelect` with the selection and the entry
     * appended. Not part of the selection otherwise: `onSelect` does not report them, and
     * they are not offered as options.
     * @remarks No restore button while disabled, as no remove button
     * @default none
     */
    removed?: DataT[];
    /**
     * State of the switch control
     */
    switchValue?: boolean;
    /**
     * Set value for switch position
     * @param checked The value of switch input
     */
    setSwitchValue?: (checked: boolean) => void;
    /**
     * Search callback which is called to load available data entries
     */
    loadDataOptions: BaseSelectorLoadHandler<DataT>;
    /**
     * Optional callback for customizing the unique identifier of data
     * @param data The data struct
     * @returns A unique ID extracted from data
     * @default returns data.value
     */
    getIdOfData?: (data: DataT) => string;
    /**
     * Comparison function (as for Array.sort) for the order of the chips. It
     * sorts a copy for display only: `selected` is not changed (it may be
     * frozen), and `onSelect` reports the entries in `selected`'s order.
     * Without it the chips are shown in `selected`'s order.
     */
    sortCompareFn?: (value1: DataT, value2: DataT) => number;
};
/**
 * Slots of MultiSelectWithoutGroup (theme `CcMultiSelectWithoutGroup`, `classes`):
 * - `outlined`: a chip of a selected or removed entry; a removed entry's chip also has the
 *   class `CcMultiSelectWithoutGroup-removed`, an added entry's `CcMultiSelectWithoutGroup-added`
 * - `changeState`: the text of a change that is not saved yet ("Added", "Removed") in a chip
 * - `switch`: the switch beside the chips
 */
export type MultiSelectWithoutGroupClassKey = "outlined" | "changeState" | "switch";
declare const MultiSelectWithoutGroup: <DataT extends MultiSelectorData>(inProps: MultiSelectWithoutGroupProps<DataT>) => React.JSX.Element;
declare const _default: typeof MultiSelectWithoutGroup;
export default _default;
