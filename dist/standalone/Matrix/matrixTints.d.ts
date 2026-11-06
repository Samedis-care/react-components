import { Theme } from "@mui/material";
/**
 * The label colors of the "current" and "accent" column headers, as the
 * custom properties the header labels read.
 * @remarks Set once on the grid root: the search for a readable color would
 * otherwise run in the style of every one of up to 400 header labels.
 */
export declare const columnLabelColorVars: (theme: Theme) => {
    "--cc-matrix-current-label-color": string;
    "--cc-matrix-accent-label-color": string;
};
/** Translucent tints for the cells that scroll (body cells). */
export declare const columnTintStyles: (theme: Theme) => {
    [x: string]: {
        backgroundColor: string;
    };
};
/**
 * Opaque tints for the sticky cells: a gradient of one flat color, layered over
 * the opaque paper background, tints the cell without making it see-through.
 */
export declare const stickyColumnTintStyles: (theme: Theme, accentExtra?: Record<string, string>) => {
    [x: string]: string | {
        backgroundImage: string;
    };
    backgroundColor: string;
};
/** One divider line on the right and the bottom of a cell. */
export declare const cellBorders: (theme: Theme) => {
    borderRight: string;
    borderBottom: string;
};
/**
 * The focus ring of an entry (a split entry or a diagonal pair). It lies just
 * outside the entry, in the tile's padding, so it stands out from the grid's
 * background whatever the entry's fill is. A line of that background inside it
 * keeps it apart from the fill where something else surrounds the entry: the
 * highlight ring, the other entry of a split pair.
 */
export declare const entryFocusRing: (theme: Theme) => {
    outline: string;
    outlineOffset: number;
    boxShadow: string;
};
