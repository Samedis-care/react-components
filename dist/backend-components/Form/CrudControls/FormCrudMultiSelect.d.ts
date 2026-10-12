import React, { RefAttributes } from "react";
import { ModelUnknown } from "../../../backend-integration/Model/Model";
import { CrudMultiSelectProps } from "../../Selector/CrudMultiSelect";
import { UseLazyCrudConnectorParams } from "../useLazyCrudConnector";
import { MultiSelectorData } from "../../../standalone";
import { CrudSelectDispatch } from "../../Selector/useCrudSelect";
export interface FormCrudMultiSelectProps<M extends ModelUnknown, DataT extends MultiSelectorData> extends Omit<CrudMultiSelectProps<M, DataT>, "errorComponent" | "connector" | "field">, UseLazyCrudConnectorParams<Record<string, unknown>> {
}
export declare const ForwardedCrudMultiSelect: <M extends ModelUnknown, DataT extends MultiSelectorData>(props: FormCrudMultiSelectProps<M, DataT> & RefAttributes<CrudSelectDispatch<DataT>>) => React.ReactElement;
declare const _default: typeof ForwardedCrudMultiSelect;
export default _default;
