import { Theme } from "@mui/material";
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
