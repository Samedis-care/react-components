import React from "react";
import type { ModelFieldName, ModelRecord, ModelUnknown } from "../../backend-integration/Model/Model";
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
     * The record of the row, as model.index returned it
     */
    record: ModelRecord<ModelUnknown>;
    /**
     * Called once a change was saved or refused, to reload the rows
     */
    refreshGrid: () => void;
}
declare const _default: React.MemoExoticComponent<(props: InlineEditCellProps) => React.ReactElement<unknown, string | React.JSXElementConstructor<any>>>;
export default _default;
