import { getContrastRatio } from "@mui/material";
import colorToRgba from "../../utils/colorToRgba";
/**
 * How strongly the fill of a dimmed entry (MatrixTileItem.dimmed) is faded:
 * its alpha is multiplied by this, in both pair layouts. The label is not
 * faded; it gets a color that reads on the faded fill (see tileColors).
 */
export const MATRIX_TILE_DIM_OPACITY = 0.6;
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
export const dimColor = (color) => {
    try {
        const rgba = colorToRgba(color);
        if (rgba)
            return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] * MATRIX_TILE_DIM_OPACITY})`;
    }
    catch {
        // canvas-less environments land here (jsdom without node-canvas)
    }
    return color;
};
/** The label colors contrastTextFor chooses from */
const WHITE = "#fff";
const BLACK = "#000";
/**
 * Resolves a color the way dimColor does.
 * @param color Any CSS color
 * @returns The channels (0-255, alpha 0-1), or undefined if it cannot be
 * resolved
 */
const resolveColor = (color) => {
    try {
        return colorToRgba(color);
    }
    catch {
        // canvas-less environments land here (jsdom without node-canvas)
        return undefined;
    }
};
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
export const contrastTextFor = (theme, background) => {
    const fill = resolveColor(background);
    if (!fill)
        return undefined;
    const paper = resolveColor(theme.palette.background.paper);
    // without a paper to measure, the fill counts as opaque
    const alpha = paper ? fill[3] : 1;
    const channels = [0, 1, 2].map((i) => fill[i] * alpha + (paper ? paper[i] * (1 - alpha) : 0));
    const shown = `rgb(${channels.join(", ")})`;
    return getContrastRatio(shown, WHITE) >= getContrastRatio(shown, BLACK)
        ? WHITE
        : BLACK;
};
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
export const tileColors = (theme, backgroundColor, textColor, dimmed) => {
    if (dimmed) {
        const fill = dimColor(backgroundColor);
        // undefined exactly when dimColor could not fade it either
        const label = contrastTextFor(theme, fill);
        if (label)
            return { fill, label };
    }
    return {
        fill: backgroundColor,
        label: textColor ?? contrastTextFor(theme, backgroundColor),
    };
};
