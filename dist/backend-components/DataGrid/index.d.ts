import React from "react";
import { DataGridDispatch, DataGridFilterParameters, DataGridProps, IDataGridAddButton } from "../../standalone/DataGrid/DataGrid";
import { ModelRecord, ModelUnknown } from "../../backend-integration/Model/Model";
export interface BackendDataGridProps<M extends ModelUnknown> extends Omit<DataGridProps, "loadData" | "columns" | "exporters" | "onDelete"> {
    /**
     * The model to use
     */
    model: M;
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
    customDeleteConfirm?: (inverted: boolean, ids: string[], filter?: DataGridFilterParameters) => Promise<void> | void;
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
    /**
     * Called once a delete has run, whether it succeeded or failed, e.g. to
     * refresh data outside the grid that the delete changed
     * @param inverted IDs inverted? (all except ids)
     * @param ids The IDs deleted (or not deleted)
     * @param filter Complex filter (see DataGridProps.onDelete)
     * @param error Why the delete failed, undefined if it succeeded
     * @remarks A failed delete may still have deleted some records. Called after
     *          the grid refreshes and before the error is shown, not when the
     *          user cancels the confirmation.
     */
    onDeleteSettled?: (inverted: boolean, ids: string[], filter: DataGridFilterParameters | undefined, error: Error | undefined) => void;
}
export declare const useBackendDataGridAddNewButtons: (props: Pick<BackendDataGridProps<ModelUnknown>, "onAddNew" | "additionalNewButtons">) => string | IDataGridAddButton[] | (() => void) | undefined;
export declare const useBackendDataGridDeleteHandler: <M extends ModelUnknown>(props: Pick<BackendDataGridProps<M>, "model" | "enableDelete" | "enableDeleteAll" | "customDeleteConfirm" | "customDeleteErrorHandler" | "onDeleteSettled">, refreshGrid: () => void) => ((invert: boolean, ids: string[], filter?: DataGridFilterParameters) => Promise<void>) | undefined;
export declare const renderDataGridRecordUsingModel: (model: ModelUnknown, refreshGrid: () => void) => (entry: ModelRecord<ModelUnknown>) => {
    id: string;
} & Record<string, string | null>;
export type BackendDataGridType = <M extends ModelUnknown>(props: BackendDataGridProps<M> & React.RefAttributes<DataGridDispatch>) => React.ReactElement | null;
declare const _default: BackendDataGridType;
export default _default;
