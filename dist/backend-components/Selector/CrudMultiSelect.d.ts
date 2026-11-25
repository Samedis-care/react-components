import React, { RefAttributes } from "react";
import { ModelUnknown } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { MultiSelectorData } from "../../standalone";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
import { CrudSelectDispatch, UseCrudSelectParams, UseCrudSelectResult } from "./useCrudSelect";
import { DistributiveOmit } from "../../utils/internal/distributiveOmit";
export type CrudMultiSelectProps<M extends ModelUnknown, DataT extends MultiSelectorData> = DistributiveOmit<BackendMultiSelectProps<M, DataT>, "modelToSelectorData" | "initialData" | "selected" | "added" | "removed" | "onSelect" | "getIdOfData"> & UseCrudSelectParams<M, DataT> & {
    /**
     * The error component that is used to display errors
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * Shows the selection without a way to change it (MultiSelectProps.readOnly): the label
     * and the entries, without search field, end adornments or remove buttons. Nothing is
     * written, as if disabled: handleSelect ignores every change and addToSelection rejects,
     * also when an end adornment or the caller's ref calls them. While the selection loads
     * the field is shown disabled, as without readOnly.
     * @default false
     */
    readOnly?: boolean;
    /**
     * Marks the field as modified (a dot after its label) while picks, removals or changes
     * of entries are queued and not saved yet
     * @remarks Only with a LazyConnector, whose writes wait for the Form's save; any other
     *          connector writes at once, and nothing is marked. An explicit `dirty` wins.
     *          The entries' own marks ("Added", "Removed" with a restore button) do not
     *          depend on it: they are shown with every LazyConnector.
     * @default false
     */
    showDirtyState?: boolean;
};
export declare const CrudSelectContext: React.Context<UseCrudSelectResult<ModelUnknown, MultiSelectorData> | undefined>;
export declare const useCrudSelectContext: () => UseCrudSelectResult<ModelUnknown, MultiSelectorData>;
declare const ForwardedCrudMultiSelect: <M extends ModelUnknown, DataT extends MultiSelectorData>(props: CrudMultiSelectProps<M, DataT> & RefAttributes<CrudSelectDispatch<DataT>>) => React.ReactElement;
declare const MemoizedCrudMultiSelect: typeof ForwardedCrudMultiSelect;
export default MemoizedCrudMultiSelect;
