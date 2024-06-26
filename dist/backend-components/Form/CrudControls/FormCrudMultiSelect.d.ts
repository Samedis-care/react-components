import React, { ForwardedRef, RefAttributes } from "react";
import { ModelFieldName, PageVisibility } from "../../../backend-integration/Model/Model";
import { CrudMultiSelectProps } from "../../Selector/CrudMultiSelect";
import { UseLazyCrudConnectorParams } from "../useLazyCrudConnector";
import { MultiSelectorData } from "../../../standalone";
import { CrudSelectDispatch } from "../../Selector/useCrudSelect";
export interface FormCrudMultiSelectProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData> extends Omit<CrudMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>, "errorComponent" | "connector" | "field">, UseLazyCrudConnectorParams<KeyT, VisibilityT, CustomT, Record<string, unknown>> {
}
declare const FormCrudMultiSelect: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData>(props: FormCrudMultiSelectProps<KeyT, VisibilityT, CustomT, DataT> & RefAttributes<CrudSelectDispatch<DataT>>, ref: ForwardedRef<CrudSelectDispatch<DataT>>) => React.JSX.Element;
declare const _default: typeof FormCrudMultiSelect;
export default _default;
