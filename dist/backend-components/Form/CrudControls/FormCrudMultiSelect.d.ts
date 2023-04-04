import React from "react";
import { ModelFieldName, PageVisibility } from "../../../backend-integration/Model/Model";
import { CrudMultiSelectProps } from "../../Selector/CrudMultiSelect";
import { UseLazyCrudConnectorParams } from "../useLazyCrudConnector";
import { MultiSelectorData } from "../../../standalone";
import { CrudSelectDispatch } from "../../Selector/useCrudSelect";
export interface FormCrudMultiSelectProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData> extends Omit<CrudMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>, "errorComponent" | "connector" | "field">, UseLazyCrudConnectorParams<KeyT, VisibilityT, CustomT, Record<string, unknown>> {
}
declare const _default: <KeyT extends string, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData>(props: FormCrudMultiSelectProps<KeyT, VisibilityT, CustomT, DataT> & React.RefAttributes<CrudSelectDispatch<DataT>>, ref: React.ForwardedRef<CrudSelectDispatch<DataT>>) => JSX.Element;
export default _default;
