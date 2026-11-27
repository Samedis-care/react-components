import React, { RefAttributes } from "react";
import { ModelUnknown } from "../../../backend-integration/Model/Model";
import { CrudMultiSelectProps } from "../../Selector/CrudMultiSelect";
import { UseLazyCrudConnectorParams } from "../useLazyCrudConnector";
import { MultiSelectorData } from "../../../standalone";
import { CrudSelectDispatch } from "../../Selector/useCrudSelect";
import { DistributiveOmit } from "../../../utils/distributiveOmit";
/**
 * Props of FormCrudMultiSelect: CrudMultiSelect's props without connector, errorComponent and
 * field, which the Form and useLazyCrudConnector supply, plus the params of
 * useLazyCrudConnector (field among them)
 * @typeParam M The searched model, whose records can be picked (`model`)
 * @typeParam DataT An entry of the selection, made from a record of the collection
 */
export type FormCrudMultiSelectProps<M extends ModelUnknown, DataT extends MultiSelectorData> = DistributiveOmit<CrudMultiSelectProps<M, DataT>, "errorComponent" | "connector" | "field"> & UseLazyCrudConnectorParams<Record<string, unknown>> & {
    /**
     * Disables the control: the search field is disabled, the entries have no remove button,
     * and nothing queues a write, neither the ref's addToSelection nor an end adornment's
     * handleSelect. The Form never disables the control, see readOnly.
     * @default false
     */
    disabled?: boolean;
    /**
     * Shows the control read-only: the label and the entries, without search field, end
     * adornments or remove buttons, and nothing queues a write. While the Form is read-only
     * the control is read-only whatever this says. A save in progress is the exception: it
     * leaves the control as it is, the focus and the text typed into the search field
     * included, and only blocks picks and removals while it runs (blockWrites).
     * @default false
     */
    readOnly?: boolean;
    /**
     * Marks the field as modified (a dot after its label) while picks, removals or changes
     * of entries are queued, until the Form saves them
     * @remarks Follows the Form's `showDirtyState` unless set. The entries' own marks
     *          ("Added", "Removed" with a restore button) are always shown.
     * @see CrudMultiSelectProps.showDirtyState
     * @default the Form's showDirtyState
     */
    showDirtyState?: boolean;
};
declare const ForwardedFormCrudMultiSelect: <M extends ModelUnknown, DataT extends MultiSelectorData>(props: FormCrudMultiSelectProps<M, DataT> & RefAttributes<CrudSelectDispatch<DataT>>) => React.ReactElement;
declare const _default: typeof ForwardedFormCrudMultiSelect;
export default _default;
