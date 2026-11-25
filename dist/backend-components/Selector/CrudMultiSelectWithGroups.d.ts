import React, { RefAttributes } from "react";
import { ModelUnknown } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { BaseSelectorData, MultiSelectorData } from "../../standalone";
import { BackendMultiSelectWithTagsProps } from "./BackendMultiSelectWithTags";
import { CrudSelectDispatch, UseCrudSelectParams } from "./useCrudSelect";
import { DistributiveOmit } from "../../utils/internal/distributiveOmit";
export type CrudMultiSelectWithGroupsProps<GroupModelT extends ModelUnknown, DataModelT extends ModelUnknown, GroupDataT extends BaseSelectorData, DataDataT extends MultiSelectorData> = DistributiveOmit<BackendMultiSelectWithTagsProps<GroupModelT, DataModelT, GroupDataT, DataDataT>, "selected" | "added" | "removed" | "onChange" | "convData" | "initialData" | "getIdOfData"> & UseCrudSelectParams<DataModelT, DataDataT> & {
    /**
     * The error component that is used to display errors
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * Get ID of data
     */
    getIdOfData: NonNullable<BackendMultiSelectWithTagsProps<GroupModelT, DataModelT, GroupDataT, DataDataT>["getIdOfData"]>;
    /**
     * Marks the title as modified (a dot after it) while picks, removals or changes of
     * entries are queued and not saved yet
     * @remarks Only with a LazyConnector, whose writes wait for the Form's save; any other
     *          connector writes at once, and nothing is marked. An explicit `dirty` wins.
     *          The entries' own marks ("Added", "Removed" with a restore button) do not
     *          depend on it: they are shown with every LazyConnector.
     * @default false
     */
    showDirtyState?: boolean;
};
declare const ForwardedCrudMultiSelectWithGroups: <GroupModelT extends ModelUnknown, DataModelT extends ModelUnknown, GroupDataT extends BaseSelectorData, DataDataT extends MultiSelectorData>(props: CrudMultiSelectWithGroupsProps<GroupModelT, DataModelT, GroupDataT, DataDataT> & RefAttributes<CrudSelectDispatch<DataDataT>>) => React.ReactElement;
declare const _default: typeof ForwardedCrudMultiSelectWithGroups;
export default _default;
