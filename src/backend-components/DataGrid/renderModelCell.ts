import React from "react";
import type {
	ModelFieldName,
	ModelRecord,
	ModelUnknown,
} from "../../backend-integration/Model/Model";
import type ModelRenderParams from "../../backend-integration/Model/RenderParams";
import { getValueByDot } from "../../utils/dotUtils";

/**
 * The change handler of a cell without an editor: its overview visibility is not
 * editable, so its renderer shows no control that could call it
 */
const notEditableInGrid = () => {
	throw new Error("Not editable in Grid");
};

/**
 * Renders the grid cell of one model field: the field's renderer with the field's
 * overview visibility, shown (a hidden column's cell is rendered as if it were shown)
 * @param model The model the record belongs to
 * @param field The field, a key of model.fields (dotted for a nested value)
 * @param record The record of the row, as model.index returned it
 * @param handleChange The change handler the renderer's control calls; by default one
 *                     that throws, for a cell without a control
 * @param gridCellLabel The accessible name of the cell's control: the field's label and
 *                      the row's label (see ModelRenderParams.gridCellLabel)
 * @returns The cell
 * @throws Error "Not supported" from a renderer that has no grid editor, for an
 *         editable overview visibility
 */
const renderModelCell = (
	model: ModelUnknown,
	field: ModelFieldName,
	record: ModelRecord<ModelUnknown>,
	handleChange: ModelRenderParams<unknown>["handleChange"] = notEditableInGrid,
	gridCellLabel?: string,
): React.ReactElement => {
	const definition = model.fields[field];
	const value = getValueByDot(field, record);
	return definition.type.render({
		field,
		value,
		touched: false,
		// grid cells render server data, there is nothing to diff against
		dirty: false,
		autoFocus: false,
		initialValue: value,
		label: definition.getLabel(),
		gridCellLabel,
		visibility: Object.assign({}, definition.visibility.overview, {
			hidden: false,
		}),
		handleChange,
		setFieldValue: () => {
			throw new Error("Not implemented in Grid");
		},
		handleBlur: () => {
			// this is unhandled in the data grid
		},
		errorMsg: null,
		warningMsg: null,
		setError: () => {
			throw new Error("Not implemented in Grid");
		},
		setFieldTouched: () => {
			throw new Error("Not implemented in Grid");
		},
		values: record,
	});
};

export default renderModelCell;
