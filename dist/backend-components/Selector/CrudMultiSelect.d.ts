import React, { ForwardedRef, RefAttributes } from "react";
import { ModelFieldName, PageVisibility } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { MultiSelectorData } from "../../standalone";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
import { CrudSelectDispatch, UseCrudSelectParams, UseCrudSelectResult } from "./useCrudSelect";
export interface CrudMultiSelectProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData> extends Omit<BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>, "modelToSelectorData" | "initialData" | "selected" | "onSelect" | "getIdOfData">, UseCrudSelectParams<KeyT, VisibilityT, CustomT, DataT> {
    /**
     * The error component that is used to display errors
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
}
export declare const CrudSelectContext: React.Context<UseCrudSelectResult<string, MultiSelectorData> | undefined>;
export declare const useCrudSelectContext: () => UseCrudSelectResult<ModelFieldName, MultiSelectorData>;
declare const CrudMultiSelect: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData>(props: CrudMultiSelectProps<KeyT, VisibilityT, CustomT, DataT> & RefAttributes<CrudSelectDispatch<DataT>>, ref: ForwardedRef<CrudSelectDispatch<DataT>>) => React.JSX.Element;
declare const _default: typeof CrudMultiSelect;
export default _default;
