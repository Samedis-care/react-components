import React from "react";
import { IDataGridLoadDataParameters, DataGridProps, IDataGridAddButton } from "../../standalone/DataGrid/DataGrid";
import Model, { ModelFieldName, PageVisibility } from "../../backend-integration/Model/Model";
export interface BackendDataGridProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomDataT> extends Omit<DataGridProps, "loadData" | "columns" | "exporters" | "onDelete"> {
    /**
     * The model to use
     */
    model: Model<KeyT, VisibilityT, CustomDataT>;
    /**
     * Enable deletion?
     */
    enableDelete?: boolean;
    /**
     * Disable export?
     */
    disableExport?: boolean;
    /**
     * Callback for custom confirmation dialog
     * @param inverted IDs inverted? (all except ids)
     * @param ids The IDs to delete (or not to delete)
     * @param filter Complex filter (see DataGridProps.onDelete)
     * @throws Error to cancel delete
     */
    customDeleteConfirm?: (inverted: boolean, ids: string[], filter?: Pick<IDataGridLoadDataParameters, "quickFilter" | "additionalFilters" | "fieldFilter">) => Promise<void> | void;
    /**
     * Additional buttons next to new button
     */
    additionalNewButtons?: IDataGridAddButton[];
    /**
     * Custom delete error handler
     * @param error The error
     * @remarks Usually shows an error dialog for the user
     */
    customDeleteErrorHandler?: (error: Error) => Promise<void> | void;
}
export declare const renderDataGridRecordUsingModel: <KeyT extends string, VisibilityT extends PageVisibility, CustomT>(model: Model<KeyT, VisibilityT, CustomT>, refreshGrid: () => void) => (entry: Record<string, unknown>) => {
    id: string;
} & Record<string, string | null>;
declare const _default: <KeyT extends string, VisibilityT extends PageVisibility, CustomDataT>(props: BackendDataGridProps<KeyT, VisibilityT, CustomDataT>) => React.JSX.Element;
export default _default;
