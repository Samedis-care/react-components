import { Theme } from "@mui/material";
/**
 * How strongly the fill of a dimmed entry (MatrixTileItem.dimmed) is faded:
 * its alpha is multiplied by this, in both pair layouts. The label is not
 * faded; it gets a color that reads on the faded fill (see tileColors).
 */
export declare const MATRIX_TILE_DIM_OPACITY = 0.6;
/**
 * Fades a color to MATRIX_TILE_DIM_OPACITY.
 * @param color Any CSS color
 * @returns The same color as rgba() at reduced alpha, or the color unchanged
 * if it cannot be resolved at all
 * @remarks Goes through colorToRgba, which reads keywords, hex, rgb(), hsl(),
 * hwb() and color(srgb …) itself and has the browser resolve the rest
 * (oklch(), lab(), color() in other spaces, color-mix(), …) on a canvas. A
 * value it cannot resolve — a CSS variable, say, or one of those where there
 * is no canvas (jsdom) — must not take a cell down, so it passes through and
 * the entry stays flat instead. An alpha the color already carries is
 * multiplied rather than replaced, so a translucent entry keeps being
 * translucent.
 */
export declare const dimColor: (color: string) => string;
/**
 * A label color that stays readable on a fill: black or white, whichever has
 * the higher contrast with the fill as it shows. That is at least 4.58:1 on
 * any opaque fill, above the 4.5:1 that WCAG 1.4.3 asks of the tile's small
 * labels.
 * @param theme The theme: a translucent fill shows over its
 * palette.background.paper, the grid's background
 * @param background The entry's fill color, any CSS color that dimColor can
 * resolve too (keywords included)
 * @returns "#fff" or "#000", or undefined if the fill cannot be resolved (a
 * var(), say: then the label inherits the surrounding text color)
 */
export declare const contrastTextFor: (theme: Theme, background: string) => string | undefined;
/**
 * The colors an entry is drawn in, the same in a split and a diagonal pair.
 * @param theme The theme (see contrastTextFor)
 * @param backgroundColor The entry's fill (MatrixTileItem.backgroundColor)
 * @param textColor The entry's label color (MatrixTileItem.textColor)
 * @param dimmed Whether the entry is dimmed (MatrixTileItem.dimmed)
 * @returns fill: backgroundColor, faded with dimColor if dimmed. label: for
 * a faded fill, black or white by contrast with the faded fill, since
 * textColor was meant for the full one; otherwise textColor, or black or
 * white by contrast with backgroundColor, or undefined if the fill cannot be
 * resolved (the label then inherits the surrounding text color)
 * @remarks A dimmed fill that cannot be resolved (a var()) is not faded, so
 * it keeps textColor.
 */
export declare const tileColors: (theme: Theme, backgroundColor: string, textColor: string | undefined, dimmed: boolean | undefined) => {
    fill: string;
    label: string | undefined;
};
