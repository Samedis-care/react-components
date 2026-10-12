import React from "react";
import { BaseSelectorData, BaseSelectorProps, MultiSelectorData } from "../../standalone";
import { BackendSingleSelectProps } from "./BackendSingleSelect";
import { BackendMultiSelectProps } from "./BackendMultiSelect";
import { ModelUnknown } from "../../backend-integration";
interface WithoutFormContext<DataT extends BaseSelectorData> {
    onAddNew?: BaseSelectorProps<DataT, false>["onAddNew"];
}
interface WithFormContext<DataT extends BaseSelectorData> {
    onAddNew?: (data: Record<string, unknown>) => ReturnType<NonNullable<BaseSelectorProps<DataT, false>["onAddNew"]>>;
}
export type WithSelectorFormContextProps<PropsT, DataT extends BaseSelectorData> = Omit<PropsT, keyof WithoutFormContext<DataT>> & WithFormContext<DataT>;
export type FormBackendSingleSelectProps<M extends ModelUnknown> = WithSelectorFormContextProps<BackendSingleSelectProps<M>, BaseSelectorData>;
export declare const FormBackendSingleSelect: <M extends ModelUnknown>(props: FormBackendSingleSelectProps<M>) => React.JSX.Element;
export type FormBackendMultiSelectProps<M extends ModelUnknown, DataT extends MultiSelectorData> = WithSelectorFormContextProps<BackendMultiSelectProps<M, DataT>, DataT>;
export declare const FormBackendMultiSelect: <M extends ModelUnknown, DataT extends MultiSelectorData>(props: FormBackendMultiSelectProps<M, DataT>) => React.JSX.Element;
export {};
