import { Theme } from "@mui/material";
/**
 * How strongly a dimmed entry is faded.
 * @remarks One half of a diagonal pair cannot use opacity (that would fade both
 * halves), so it dims its gradient color with dimColor below.
 */
export declare const MATRIX_TILE_DIM_OPACITY = 0.6;
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
export declare const dimColor: (color: string) => string;
/**
 * A label color that stays readable on a fill.
 * @param theme The theme, whose getContrastText decides — so a consumer that
 * raises palette.contrastThreshold moves tile labels with everything else
 * @param background The entry's fill color
 * @returns The contrasting text color, or undefined if the fill cannot be
 * decomposed (then the label inherits, as it always did)
 * @remarks Without this, an entry that brings a fill but no textColor draws its
 * label in the theme's text color — near-black on a dark fill in a light theme.
 */
export declare const contrastTextFor: (theme: Theme, background: string) => string | undefined;
