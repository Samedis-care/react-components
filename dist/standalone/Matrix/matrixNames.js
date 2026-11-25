/**
 * Is this part of an accessible name there at all? React renders nothing for
 * null, undefined and booleans, and an empty string says nothing.
 * @param part A part of a name: text or a node
 * @returns Whether it adds anything to the name
 */
export const isNamePart = (part) => part != null && typeof part !== "boolean" && part !== "";
/**
 * A node as text, if it is text
 * @param node What a column header or row header renders
 * @returns The node as a string if it is a string or a number, else undefined
 */
const textOf = (node) => typeof node === "string" || typeof node === "number"
    ? String(node)
    : undefined;
/**
 * The column in words, for accessible names
 * @param column The column
 * @returns MatrixColumn.name, or the label when that is text
 */
export const columnNameOf = (column) => column.name ?? textOf(column.label);
/**
 * The aggregate row in words, for the accessible names of its cells
 * @param extraRow The aggregate row
 * @returns MatrixExtraRow.label, or the header when that is text
 */
export const extraRowNameOf = (extraRow) => extraRow.label || textOf(extraRow.header);
