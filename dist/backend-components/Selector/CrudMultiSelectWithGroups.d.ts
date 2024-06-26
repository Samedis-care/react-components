import React, { ForwardedRef, RefAttributes } from "react";
import { ModelFieldName, PageVisibility } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { BaseSelectorData, MultiSelectorData } from "../../standalone";
import { BackendMultiSelectWithTagsProps } from "./BackendMultiSelectWithTags";
import { CrudSelectDispatch, UseCrudSelectParams } from "./useCrudSelect";
export interface CrudMultiSelectWithGroupsProps<GroupKeyT extends ModelFieldName, DataKeyT extends ModelFieldName, GroupVisibilityT extends PageVisibility, DataVisibilityT extends PageVisibility, GroupCustomT, DataCustomT, GroupDataT extends BaseSelectorData, DataDataT extends MultiSelectorData> extends Omit<BackendMultiSelectWithTagsProps<GroupKeyT, DataKeyT, GroupVisibilityT, DataVisibilityT, GroupCustomT, DataCustomT, GroupDataT, DataDataT>, "selected" | "onChange" | "convData" | "initialData" | "getIdOfData">, UseCrudSelectParams<DataKeyT, DataVisibilityT, DataCustomT, DataDataT> {
    /**
     * The error component that is used to display errors
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * Get ID of data
     */
    getIdOfData: NonNullable<BackendMultiSelectWithTagsProps<GroupKeyT, DataKeyT, GroupVisibilityT, DataVisibilityT, GroupCustomT, DataCustomT, GroupDataT, DataDataT>["getIdOfData"]>;
}
declare const CrudMultiSelectWithGroups: <GroupKeyT extends ModelFieldName, DataKeyT extends ModelFieldName, GroupVisibilityT extends PageVisibility, DataVisibilityT extends PageVisibility, GroupCustomT, DataCustomT, GroupDataT extends BaseSelectorData, DataDataT extends MultiSelectorData>(props: CrudMultiSelectWithGroupsProps<GroupKeyT, DataKeyT, GroupVisibilityT, DataVisibilityT, GroupCustomT, DataCustomT, GroupDataT, DataDataT> & RefAttributes<CrudSelectDispatch<DataDataT>>, ref: ForwardedRef<CrudSelectDispatch<DataDataT>>) => React.JSX.Element;
declare const _default: typeof CrudMultiSelectWithGroups;
export default _default;
