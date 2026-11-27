import React from "react";
import { ModelFieldName, ModelRecord, ModelUnknown } from "../../backend-integration/Model/Model";
import { DataGridRowData } from "../../standalone/DataGrid/DataGrid";
export interface InlineEditCellProps {
    /**
     * The model the record belongs to
     */
    model: ModelUnknown;
    /**
     * The field the cell edits, a key of model.fields (dotted for a nested value)
     */
    field: ModelFieldName;
    /**
     * The record of the row, as model.index returned it, or as the last save in one of
     * the row's cells left it
     */
    record: ModelRecord<ModelUnknown>;
    /**
     * Builds the grid row of a record, as the cell's row was built
     * (renderDataGridRecordUsingModel): a save replaces the row with the row of the
     * saved record
     */
    renderRow: (record: ModelRecord<ModelUnknown>) => DataGridRowData;
}
declare const _default: React.MemoExoticComponent<(props: InlineEditCellProps) => React.ReactElement<unknown, string | React.JSXElementConstructor<any>>>;
export default _default;
