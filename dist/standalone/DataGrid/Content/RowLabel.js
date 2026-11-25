import React, { useContext } from "react";
/** The text in a React node: its strings and numbers, children included */
const textOfNode = (node) => {
    if (typeof node === "string")
        return node;
    if (typeof node === "number")
        return String(node);
    if (Array.isArray(node))
        return node.map(textOfNode).join("");
    if (React.isValidElement(node))
        return textOfNode(node.props.children);
    return "";
};
/** The text a cell shows for a row's value (see Cell) */
const textOfValue = (value) => (value &&
    typeof value === "object" &&
    !React.isValidElement(value) &&
    "toString" in value
    ? value.toString()
    : textOfNode(value))
    .replace(/\s+/g, " ")
    .trim();
const TEXT_TYPES = [
    "string",
    "localized-string",
    "combined-string",
];
/**
 * The default of DataGridProps.getRowLabel: the text of the first visible
 * column that shows text, text columns first
 * @param record The row
 * @param columns The visible columns, in the order they are shown
 * @returns The text; an empty string if no column shows any
 */
export const getRowLabelDefault = (record, columns) => {
    let fallback = "";
    for (const column of columns) {
        const text = textOfValue(record[column.field]);
        if (!text)
            continue;
        if (TEXT_TYPES.includes(column.type))
            return text;
        fallback ||= text;
    }
    return fallback;
};
/**
 * The label of the row a data cell is in, as its row checkbox uses it: what the
 * grid's DataGridProps.getRowLabel returns, else getRowLabelDefault. Provided by
 * Cell around a data cell's content, so that a control in the cell can name itself
 * after its row ("Active, Carol Jones").
 * @remarks undefined outside a data cell, e.g. for a cell rendered on its own
 */
export const RowLabelContext = React.createContext(undefined);
/**
 * The label of the row the calling control is rendered in, composed when the
 * control renders so that it follows a language switch and a getRowLabel replaced
 * after mount
 * @returns The row's label (RowLabelContext); an empty string outside a data cell
 *          or when the row has no label
 */
export const useRowLabel = () => useContext(RowLabelContext)?.() ?? "";
