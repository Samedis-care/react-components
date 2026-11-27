import React from "react";
import type { ModelFieldName, ModelRecord, ModelUnknown } from "../../backend-integration/Model/Model";
export interface ModelCellProps {
    /**
     * The model the record belongs to
     */
    model: ModelUnknown;
    /**
     * The field the cell shows, a key of model.fields (dotted for a nested value)
     */
    field: ModelFieldName;
    /**
     * The record of the row, as model.index returned it
     */
    record: ModelRecord<ModelUnknown>;
    /**
     * The cell as renderModelCell rendered it when the row was built, shown while
     * components-care's language is the one it was rendered in. It stays the
     * element's children, where the grid's default row label reads the text of a
     * cell (getRowLabelDefault).
     */
    children: React.ReactElement;
    /**
     * components-care's language (ccI18n.language) when children was rendered
     */
    language: string;
}
declare const _default: React.MemoExoticComponent<(props: ModelCellProps) => React.ReactElement<unknown, string | React.JSXElementConstructor<any>>>;
export default _default;
