import React from "react";
import { DataGridDispatch, DataGridFilterParameters, DataGridProps, IDataGridAddButton } from "../../standalone/DataGrid/DataGrid";
import { ModelRecord, ModelUnknown } from "../../backend-integration/Model/Model";
export interface BackendDataGridProps<M extends ModelUnknown> extends Omit<DataGridProps, "loadData" | "columns" | "exporters" | "onDelete" | "getRowLabel"> {
    /**
     * The model to use
     */
    model: M;
    /**
     * The text that identifies a row to assistive technology, e.g. a person's
     * name: the row's checkbox is named after it ("Select Carol Jones"), and a
     * customSelectionControl gets it as rowLabel.
     * Defaults to DataGridProps.getRowLabel's default: the text the first
     * visible text column shows.
     * @param record The row's record, as the model's index returned it
     * @return The label; an empty string names the checkbox "Select row"
     */
    getRowLabel?: (record: ModelRecord<M>) => string;
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
/**
 * The delete handler BackendDataGrid passes to DataGrid as onDelete: it asks for
 * confirmation (customDeleteConfirm or the built-in dialog), deletes through the
 * model, calls refreshGrid and onDeleteSettled, and reports a failure
 * (customDeleteErrorHandler or the built-in error dialog).
 * @param props The delete props of BackendDataGrid
 * @param refreshGrid Called after the delete ran, failed or not, to reload the rows
 * @returns The handler, or undefined without enableDelete. The handler resolves false
 *          when the user cancels the confirmation: nothing was deleted, so the grid
 *          keeps the selection. It resolves true once the delete ran, also when it
 *          failed (a failed delete may have deleted some of the records).
 */
export declare const useBackendDataGridDeleteHandler: <M extends ModelUnknown>(props: Pick<BackendDataGridProps<M>, "model" | "enableDelete" | "enableDeleteAll" | "customDeleteConfirm" | "customDeleteErrorHandler" | "onDeleteSettled">, refreshGrid: () => void) => ((invert: boolean, ids: string[], filter?: DataGridFilterParameters) => Promise<boolean>) | undefined;
/**
 * Turns a record from model.index into a grid row: `row.id` is the record's id,
 * `row[field]` the rendered cell of each model field and `row[field + "_raw"]` its
 * value. A field with an editable overview visibility (ModelVisibilityGridEdit) is
 * edited in its cell, which saves every change at once through
 * model.connector.update, then calls refreshGrid; a refused save is shown in an error
 * dialog (the cell needs the Framework), and refreshGrid is called as well.
 * @param model The model the record belongs to
 * @param refreshGrid Called after an inline edit was saved or refused, to reload the
 *                    rows
 * @returns A function that builds the row of one record. It throws "Not supported"
 *          for an editable field whose renderer has no grid editor.
 */
export declare const renderDataGridRecordUsingModel: (model: ModelUnknown, refreshGrid: () => void) => (entry: ModelRecord<ModelUnknown>) => {
    id: string;
} & Record<string, string | null>;
/**
 * DataGridProps.getRowLabel for a grid whose rows renderDataGridRecordUsingModel
 * rendered, from a getRowLabel that takes the model's record
 * (BackendDataGridProps.getRowLabel)
 * @param model The model the rows are rendered with
 * @param getRowLabel The row label from the model's record, or undefined for
 *                    the grid's default
 * @returns The grid's getRowLabel, undefined without getRowLabel
 */
export declare const useBackendDataGridRowLabel: <M extends ModelUnknown>(model: M, getRowLabel: ((record: ModelRecord<M>) => string) | undefined) => DataGridProps["getRowLabel"];
export type BackendDataGridType = <M extends ModelUnknown>(props: BackendDataGridProps<M> & React.RefAttributes<DataGridDispatch>) => React.ReactElement | null;
declare const _default: BackendDataGridType;
export default _default;
