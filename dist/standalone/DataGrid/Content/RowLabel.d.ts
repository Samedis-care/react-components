import React from "react";
import type { DataGridRowData, IDataGridColumnDef } from "../DataGrid";
/**
 * The default of DataGridProps.getRowLabel: the text of the first visible
 * column that shows text, text columns first
 * @param record The row
 * @param columns The visible columns, in the order they are shown
 * @returns The text; an empty string if no column shows any
 */
export declare const getRowLabelDefault: (record: DataGridRowData, columns: IDataGridColumnDef[]) => string;
/**
 * The label of the row a data cell is in, as its row checkbox uses it: what the
 * grid's DataGridProps.getRowLabel returns, else getRowLabelDefault. Provided by
 * Cell around a data cell's content, so that a control in the cell can name itself
 * after its row ("Active, Carol Jones").
 * @remarks undefined outside a data cell, e.g. for a cell rendered on its own
 */
export declare const RowLabelContext: React.Context<(() => string) | undefined>;
/**
 * The label of the row the calling control is rendered in, composed when the
 * control renders so that it follows a language switch and a getRowLabel replaced
 * after mount
 * @returns The row's label (RowLabelContext); an empty string outside a data cell
 *          or when the row has no label
 */
export declare const useRowLabel: () => string;
