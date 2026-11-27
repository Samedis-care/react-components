import React from "react";
import useCCLanguage from "../../utils/internal/useCCLanguage";
import renderModelCell from "./renderModelCell";
/**
 * The cell of a field the grid only shows (an overview visibility that is not
 * editable). The renderers translate while they render ("Yes", enum labels,
 * formatted dates), so once components-care's language differs from the one the
 * row was built in, the cell renders the field again in the current language: when
 * the language changes, and when the cell mounts after a change (a row scrolled into
 * view).
 */
const ModelCell = (props) => {
    const { model, field, record, children, language } = props;
    // renders the cell again when the language changes
    return useCCLanguage() === language
        ? children
        : renderModelCell(model, field, record);
};
export default React.memo(ModelCell);
