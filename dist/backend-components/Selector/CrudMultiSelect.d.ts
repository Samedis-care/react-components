import React, { RefAttributes } from "react";
import { ModelUnknown } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { MultiSelectorData } from "../../standalone";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
import { CrudSelectDispatch, UseCrudSelectParams, UseCrudSelectResult } from "./useCrudSelect";
export interface CrudMultiSelectProps<M extends ModelUnknown, DataT extends MultiSelectorData> extends Omit<BackendMultiSelectProps<M, DataT>, "modelToSelectorData" | "initialData" | "selected" | "onSelect" | "getIdOfData">, UseCrudSelectParams<M, DataT> {
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
}
export declare const CrudSelectContext: React.Context<UseCrudSelectResult<ModelUnknown, MultiSelectorData> | undefined>;
export declare const useCrudSelectContext: () => UseCrudSelectResult<ModelUnknown, MultiSelectorData>;
declare const ForwardedCrudMultiSelect: <M extends ModelUnknown, DataT extends MultiSelectorData>(props: CrudMultiSelectProps<M, DataT> & RefAttributes<CrudSelectDispatch<DataT>>) => React.ReactElement;
declare const MemoizedCrudMultiSelect: typeof ForwardedCrudMultiSelect;
export default MemoizedCrudMultiSelect;
