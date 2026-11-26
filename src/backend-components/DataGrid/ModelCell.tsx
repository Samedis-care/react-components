import React from "react";
import type {
	ModelFieldName,
	ModelRecord,
	ModelUnknown,
} from "../../backend-integration/Model/Model";
import useCCLanguage from "../../utils/internal/useCCLanguage";
import renderModelCell from "./renderModelCell";

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

/**
 * The cell of a field the grid only shows (an overview visibility that is not
 * editable). The renderers translate while they render ("Yes", enum labels,
 * formatted dates), so once components-care's language differs from the one the
 * row was built in, the cell renders the field again in the current language: when
 * the language changes, and when the cell mounts after a change (a row scrolled into
 * view).
 */
const ModelCell = (props: ModelCellProps) => {
	const { model, field, record, children, language } = props;
	// renders the cell again when the language changes
	return useCCLanguage() === language
		? children
		: renderModelCell(model, field, record);
};

export default React.memo(ModelCell);
