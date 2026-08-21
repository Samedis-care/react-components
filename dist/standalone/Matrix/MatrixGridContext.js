import React, { useContext } from "react";
export const defaultIsCellSelectable = (cell) => cell === undefined;
export const defaultIsCellOccupied = (cell) => cell !== undefined;
/**
 * May a range start on, or run through, this cell? The one implementation: the
 * store clamps and paints with it, and the cell decides with it whether to
 * listen for a press at all.
 */
export const isCellSelectableIn = (config, row, column, columnIndex) => config.selectable &&
    row.selectable !== false &&
    config.isCellSelectable(row.cells[column.key], { row, column, columnIndex });
export const MatrixConfigContext = React.createContext(undefined);
export const useMatrixConfig = () => {
    const ctx = useContext(MatrixConfigContext);
    if (!ctx)
        throw new Error("Matrix config context not set");
    // The context cannot be generic; the grid puts its own config in and every
    // consumer reads it back with the same TCell it was rendered for — which
    // type-checks on its own, the callbacks being contravariant in the cell.
    return ctx;
};
