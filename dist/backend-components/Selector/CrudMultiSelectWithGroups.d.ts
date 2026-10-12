import React, { RefAttributes } from "react";
import { ModelUnknown } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { BaseSelectorData, MultiSelectorData } from "../../standalone";
import { BackendMultiSelectWithTagsProps } from "./BackendMultiSelectWithTags";
import { CrudSelectDispatch, UseCrudSelectParams } from "./useCrudSelect";
export interface CrudMultiSelectWithGroupsProps<GroupModelT extends ModelUnknown, DataModelT extends ModelUnknown, GroupDataT extends BaseSelectorData, DataDataT extends MultiSelectorData> extends Omit<BackendMultiSelectWithTagsProps<GroupModelT, DataModelT, GroupDataT, DataDataT>, "selected" | "onChange" | "convData" | "initialData" | "getIdOfData">, UseCrudSelectParams<DataModelT, DataDataT> {
    /**
     * The error component that is used to display errors
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * Get ID of data
     */
    getIdOfData: NonNullable<BackendMultiSelectWithTagsProps<GroupModelT, DataModelT, GroupDataT, DataDataT>["getIdOfData"]>;
}
declare const ForwardedCrudMultiSelectWithGroups: <GroupModelT extends ModelUnknown, DataModelT extends ModelUnknown, GroupDataT extends BaseSelectorData, DataDataT extends MultiSelectorData>(props: CrudMultiSelectWithGroupsProps<GroupModelT, DataModelT, GroupDataT, DataDataT> & RefAttributes<CrudSelectDispatch<DataDataT>>) => React.ReactElement;
declare const _default: typeof ForwardedCrudMultiSelectWithGroups;
export default _default;
