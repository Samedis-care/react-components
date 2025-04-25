import React, { RefAttributes } from "react";
import { ModelFieldName, PageVisibility } from "../../../backend-integration/Model/Model";
import { CrudMultiSelectProps } from "../../Selector/CrudMultiSelect";
import { UseLazyCrudConnectorParams } from "../useLazyCrudConnector";
import { MultiSelectorData } from "../../../standalone";
import { CrudSelectDispatch } from "../../Selector/useCrudSelect";
export interface FormCrudMultiSelectProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData> extends Omit<CrudMultiSelectProps<KeyT, VisibilityT, CustomT, DataT>, "errorComponent" | "connector" | "field">, UseLazyCrudConnectorParams<KeyT, VisibilityT, CustomT, Record<string, unknown>> {
}
export declare const ForwardedCrudMultiSelect: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData>(props: FormCrudMultiSelectProps<KeyT, VisibilityT, CustomT, DataT> & RefAttributes<CrudSelectDispatch<DataT>>) => React.ReactElement;
declare const _default: typeof ForwardedCrudMultiSelect;
export default _default;
