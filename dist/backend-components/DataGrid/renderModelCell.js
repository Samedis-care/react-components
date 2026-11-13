import { getValueByDot } from "../../utils/dotUtils";
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
const renderModelCell = (model, field, record, handleChange) => {
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
