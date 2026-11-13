import React from "react";
import type { ModelFieldName, ModelRecord, ModelUnknown } from "../../backend-integration/Model/Model";
import type ModelRenderParams from "../../backend-integration/Model/RenderParams";
/**
 * Renders the grid cell of one model field: the field's renderer with the field's
 * overview visibility, shown (a hidden column's cell is rendered as if it were shown)
 * @param model The model the record belongs to
 * @param field The field, a key of model.fields (dotted for a nested value)
 * @param record The record of the row, as model.index returned it
 * @param handleChange The change handler the renderer's control calls
 * @returns The cell
 * @throws Error "Not supported" from a renderer that has no grid editor, for an
 *         editable overview visibility
 */
declare const renderModelCell: (model: ModelUnknown, field: ModelFieldName, record: ModelRecord<ModelUnknown>, handleChange: ModelRenderParams<unknown>["handleChange"]) => React.ReactElement;
export default renderModelCell;
