import { alpha } from "@mui/material";

/**
 * How strongly a dimmed entry is faded.
 * @remarks One half of a diagonal pair cannot use opacity (that would fade both
 * halves), so it dims its gradient color with dimColor below.
 */
export const MATRIX_TILE_DIM_OPACITY = 0.6;

/**
 * Fades a color to MATRIX_TILE_DIM_OPACITY.
 * @param color Any CSS color
 * @returns The color at reduced alpha, or the color unchanged if it is not one
 * MUI can decompose
 * @remarks alpha() covers hex (3, 4, 6 and 8 digits), rgb(), hsl() and color(),
 * but throws on a keyword or a CSS variable — which must not take a cell down,
 * so those pass through and the entry stays flat instead.
 */
export const dimColor = (color: string): string => {
	try {
		return alpha(color, MATRIX_TILE_DIM_OPACITY);
	} catch {
		return color;
	}
};
