import { getContrastRatio } from "@mui/material";
import colorToRgba from "../../utils/colorToRgba";
/**
 * How strongly a dimmed entry is faded.
 * @remarks One half of a diagonal pair cannot use opacity (that would fade both
 * halves), so it dims its gradient color with dimColor below.
 */
export const MATRIX_TILE_DIM_OPACITY = 0.6;
/**
 * Fades a color to MATRIX_TILE_DIM_OPACITY.
 * @param color Any CSS color
 * @returns The color at reduced alpha, or the color unchanged if it cannot be
 * resolved at all
 * @remarks Goes through colorToRgba, which covers hex (3, 4, 6 and 8 digits),
 * rgb(), hsl() and all CSS keywords, with a canvas fallback. A value it cannot
 * resolve — a CSS variable, say — must not take a cell down, so it passes
 * through and the entry stays flat instead. An alpha the color already carries
 * is multiplied rather than replaced, so a translucent entry keeps being
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
