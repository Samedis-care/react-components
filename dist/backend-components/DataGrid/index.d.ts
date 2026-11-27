import React from "react";
import { DataGridDispatch, DataGridFilterParameters, DataGridProps, IDataGridAddButton } from "../../standalone/DataGrid/DataGrid";
import { ModelRecord, ModelUnknown } from "../../backend-integration/Model/Model";
export interface BackendDataGridProps<M extends ModelUnknown> extends Omit<DataGridProps, "loadData" | "columns" | "exporters" | "onDelete" | "deleting" | "getRowLabel"> {
    /**
     * The model: its fields give the columns, its index loads the rows, and its
     * connector deletes (Delete) and exports (Export).
     *
     * A new instance applies at once to the columns (headers, filters, sorting), to
     * Delete, to Export and to the loads from then on, but the rows already loaded
     * stay and nothing is requested: they load through the new instance at the next
     * reload (a search, filter or sort change, or forceRefreshToken). That suits a
     * new instance for the same data, e.g. a model rebuilt on useTranslation's t
     * after a language change: its headers show without a request.
     *
     * A model for other data (another tenant, parent record or fixed filter) needs
     * the grid remounted with a key that names it (e.g. the tenant's id), or a
     * forceRefreshToken change in the same render. A key shows none of the old rows:
     * the grid opens with what its persist provider stores (or the defaults), and
     * the selection and the scroll position start over. A forceRefreshToken change
     * keeps the search, filters and sort, and the old rows show until the reload
     * starts (after the grid's reload delay, as for a search). Without either, the
     * old rows stay under the new model: Delete sends their ids to the new model's
     * connector, an edit in one of their cells saves through the old model, and
     * Export and the pages loaded on scrolling come from the new model's data. A
     * selection passed through the selection prop stays in every case: clear it
     * when the data changes.
     * @remarks Pass a stable instance, memoized on what it depends on (e.g. a tenant
     *          and useTranslation's t): every new instance computes the columns
     *          again. The column headers are read from the model's labels (getLabel,
     *          getHeaderName, getColumnLabel) once per model instance, so a model
     *          whose labels change, e.g. with the language, has to be a new instance.
     *          The loaded rows' cells render through the model they were loaded
     *          with: they render again in components-care's current language when it
     *          changes, but a text that model takes from the app, e.g. an enum label
     *          translated with useTranslation's t, keeps the language of the load
     *          until the next reload.
     */
    model: M;
    /**
     * Changing it reloads the rows through the model's index, as a search change
     * does (DataGridProps.forceRefreshToken): the search, filters and sort stay.
     * Change it after the records changed outside the grid, and in the same render
     * as a model for other data (see model).
     */
    forceRefreshToken?: string;
    /**
     * The text that identifies a row to assistive technology, e.g. a person's
     * name: the row's checkbox is named after it ("Select Carol Jones"), a
     * customSelectionControl gets it as rowLabel, and a control edited in a cell
     * is named after it and its field ("Active, Carol Jones").
     * Defaults to DataGridProps.getRowLabel's default: the text the first
     * visible text column shows.
     * @param record The row's record, as the model's index returned it
     * @return The label; an empty string names the checkbox "Select row" and
     *         leaves a control edited in a cell named after its field alone
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
     * Additional buttons next to new button. On phones (xs) they are entries
     * of the header's "More options" menu (see DataGridProps.onAddNew).
     */
    additionalNewButtons?: IDataGridAddButton[];
    /**
     * Custom delete error handler
     * @param error The error
     * @remarks Usually shows an error dialog for the user
     */
    customDeleteErrorHandler?: (error: Error) => Promise<void> | void;
    /**
     * Custom delete success handler, called once a delete went through, instead
     * of the built-in toast ("2 entries deleted", announced politely), e.g. to
     * word it for what the grid's delete means to the user
     * @param inverted IDs inverted? (all except ids)
     * @param ids The IDs deleted (or not deleted)
     * @param filter Complex filter (see DataGridProps.onDelete)
     * @remarks Called after the grid refreshes and before onDeleteSettled
     */
    customDeleteSuccessHandler?: (inverted: boolean, ids: string[], filter: DataGridFilterParameters | undefined) => void;
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
 * The delete props of BackendDataGrid that useBackendDataGridDeleteHandler takes
 */
type BackendDataGridDeleteProps<M extends ModelUnknown> = Pick<BackendDataGridProps<M>, "model" | "enableDelete" | "enableDeleteAll" | "customDeleteConfirm" | "customDeleteErrorHandler" | "customDeleteSuccessHandler" | "onDeleteSettled">;
/**
 * The delete handler BackendDataGrid passes to DataGrid as onDelete: it asks for
 * confirmation (customDeleteConfirm or the built-in dialog), deletes through the
 * model, calls refreshGrid, announces the delete (customDeleteSuccessHandler or a
 * toast such as "2 entries deleted"), calls onDeleteSettled, and reports a failure
 * (customDeleteErrorHandler or the built-in error dialog). It needs the Framework
 * (its dialogs and toasts).
 * @param props The delete props of BackendDataGrid
 * @param refreshGrid Called after the delete ran, failed or not, to reload the rows
 * @returns The handler, or undefined without enableDelete. The handler resolves false
 *          when the user cancels the confirmation: nothing was deleted, so the grid
 *          keeps the selection. It resolves true once the delete ran, also when it
 *          failed (a failed delete may have deleted some of the records).
 */
export declare const useBackendDataGridDeleteHandler: <M extends ModelUnknown>(props: BackendDataGridDeleteProps<M>, refreshGrid: () => void) => ((invert: boolean, ids: string[], filter?: DataGridFilterParameters) => Promise<boolean>) | undefined;
/**
 * Turns a record from model.index into a grid row: `row.id` is the record's id,
 * `row[field]` the rendered cell of each model field and `row[field + "_raw"]` its
 * value. A cell renders again in components-care's current language when it changes
 * (ModelCell), since the renderers translate while they render ("Yes", enum labels,
 * formatted dates). A field with an editable overview visibility
 * (ModelVisibilityGridEdit) is edited in its cell (InlineEditCell), which needs the
 * Framework: the control shows a change at once and saves it through the model's
 * mutation (useModelMutation, so the model's cache, hooks and "mutate" listeners hear of
 * it). Once saved, the DataGrid the row is in replaces the row with the row of the saved
 * record, without a reload, so the selection and the focused control stay; a refused
 * save is shown in an error dialog, and the control shows the row's value again. The
 * cell's control is named after its field and the row ("Active, example.com"), since a
 * grid cell has no label element to name it.
 * @param model The model the record belongs to
 * @returns A function that builds the row of one record. It throws "Not supported"
 *          for an editable field whose renderer has no grid editor.
 */
export declare const renderDataGridRecordUsingModel: (model: ModelUnknown) => (entry: ModelRecord<ModelUnknown>) => {
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
