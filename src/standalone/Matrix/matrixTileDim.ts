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
export const dimColor = (color: string): string => {
	try {
		const rgba = colorToRgba(color);
		if (rgba)
			return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${
				rgba[3] * MATRIX_TILE_DIM_OPACITY
			})`;
	} catch {
		// canvas-less environments land here (jsdom without node-canvas)
	}
	return color;
};

/**
 * A label color that stays readable on a fill.
 * @param background The entry's fill color
 * @returns Black or white, whichever contrasts more, or undefined if the fill
 * cannot be resolved (then the label inherits, as it always did)
 * @remarks Without this, an entry that brings a fill but no textColor draws its
 * label in the theme's text color — near-black on a dark fill in a light theme.
 */
export const contrastTextFor = (background: string): string | undefined => {
	try {
		const rgba = colorToRgba(background);
		if (!rgba) return undefined;
		const channel = (value: number) => {
			const srgb = value / 255;
			return srgb <= 0.03928
				? srgb / 12.92
				: Math.pow((srgb + 0.055) / 1.055, 2.4);
		};
		const luminance =
			0.2126 * channel(rgba[0]) +
			0.7152 * channel(rgba[1]) +
			0.0722 * channel(rgba[2]);
		// the usual threshold for picking between black and white text
		return luminance > 0.179 ? "#000000" : "#ffffff";
	} catch {
		return undefined;
	}
};
