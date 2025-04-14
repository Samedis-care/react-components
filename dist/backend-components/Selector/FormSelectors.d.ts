import React from "react";
import { BaseSelectorData, BaseSelectorProps, MultiSelectorData } from "../../standalone";
import { BackendSingleSelectProps } from "./BackendSingleSelect";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
import { ModelFieldName, PageVisibility } from "../../backend-integration";
interface WithoutFormContext<DataT extends BaseSelectorData> {
    onAddNew?: BaseSelectorProps<DataT, false>["onAddNew"];
}
interface WithFormContext<DataT extends BaseSelectorData> {
    onAddNew?: (data: Record<string, unknown>) => ReturnType<NonNullable<BaseSelectorProps<DataT, false>["onAddNew"]>>;
}
export type WithSelectorFormContextProps<PropsT, DataT extends BaseSelectorData> = Omit<PropsT, keyof WithoutFormContext<DataT>> & WithFormContext<DataT>;
export type FormBackendSingleSelectProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> = WithSelectorFormContextProps<BackendSingleSelectProps<KeyT, VisibilityT, CustomT>, BaseSelectorData>;
export declare const FormBackendSingleSelect: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(props: FormBackendSingleSelectProps<KeyT, VisibilityT, CustomT>) => React.JSX.Element;
export type FormBackendMultiSelectProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData> = WithSelectorFormContextProps<BackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>, DataT>;
export declare const FormBackendMultiSelect: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData>(props: FormBackendMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>) => React.JSX.Element;
export {};
