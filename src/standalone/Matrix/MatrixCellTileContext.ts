import React, { useContext } from "react";
import { MatrixTileItem } from "./types";

export type MatrixCellTileClassKey =
	| "root"
	| "item"
	| "itemContent"
	| "highlight"
	| "diagonal"
	| "diagonalLabel"
	| "placeholder"
	| "corner";

export interface MatrixCellTileProps {
	/**
	 * The entries in this cell. At most two are rendered — a cell is too small
	 * for more, and the third entry would be unreadable.
	 */
	items: MatrixTileItem[];
	/**
	 * How two entries share the cell: side by side (split) or as a diagonally
	 * cut single box (diagonal).
	 *
	 * The diagonal layout trades detail for space: the pair is ONE click target
	 * and one drag handle (reporting the first entry), and of each entry only
	 * the label and the fill color are drawn — secondaryLabel, flow and every
	 * corner but the first entry's bottomLeft are dropped. Switching this in the
	 * theme therefore hides props a consumer supplied.
	 * @default "split"
	 */
	pairLayout?: "split" | "diagonal";
	/**
	 * Which way a split pair is stacked
	 * @default "row"
	 */
	splitDirection?: "row" | "column";
	/**
	 * Rendered when there are no entries at all. Use it to say something about
	 * the cell itself (an absence, a closed day) — it sits on a muted panel.
	 */
	placeholder?: React.ReactNode;
	/**
	 * Called with the clicked entry. In the diagonal layout the pair reports
	 * the first entry, since the halves are not separate targets.
	 */
	onItemClick?: (item: MatrixTileItem) => void;
	/**
	 * Wraps every rendered entry, so each one can become a drag handle without
	 * this component knowing anything about drag & drop. Not called for a
	 * diagonal pair — those two halves are one box.
	 */
	renderItem?: (item: MatrixTileItem, node: React.ReactNode) => React.ReactNode;
	/**
	 * CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom CSS classes
	 */
	classes?: Partial<Record<MatrixCellTileClassKey, string>>;
}

/**
 * The tile's resolved props, so an entry can read the classes and callbacks it
 * needs itself instead of having them drilled in as props its memo then has to
 * compare.
 */
export const MatrixCellTilePropsContext = React.createContext<
	MatrixCellTileProps | undefined
>(undefined);

export const useMatrixCellTileProps = (): MatrixCellTileProps => {
	const ctx = useContext(MatrixCellTilePropsContext);
	if (!ctx) throw new Error("Matrix cell tile props context not set");
	return ctx;
};
