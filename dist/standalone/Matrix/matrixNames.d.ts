import React from "react";
import { MatrixColumn, MatrixExtraRow } from "./types";
/**
 * Is this part of an accessible name there at all? React renders nothing for
 * null, undefined and booleans, and an empty string says nothing.
 * @param part A part of a name: text or a node
 * @returns Whether it adds anything to the name
 */
export declare const isNamePart: (part: React.ReactNode) => boolean;
/**
 * The column in words, for accessible names
 * @param column The column
 * @returns MatrixColumn.name, or the label when that is text
 */
export declare const columnNameOf: (column: MatrixColumn) => string | undefined;
/**
 * The aggregate row in words, for the accessible names of its cells
 * @param extraRow The aggregate row
 * @returns MatrixExtraRow.label, or the header when that is text
 */
export declare const extraRowNameOf: (extraRow: MatrixExtraRow) => string | undefined;
