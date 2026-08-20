import { alpha, Theme } from "@mui/material";
import { matrixClasses } from "./matrixClasses";

/**
 * The column tints, as style objects keyed by state class.
 *
 * Body cells sit in the scroll flow, so they can be translucent. The sticky
 * header and row header must NOT be — content scrolls underneath them — so
 * those layer the same tint over an opaque background instead of blending with
 * whatever passes behind.
 */
const tint = (
	theme: Theme,
	variant: "muted" | "current" | "accent",
): string => {
	const dark = theme.palette.mode === "dark";
	switch (variant) {
		case "muted":
			// Neutral on purpose: a de-emphasized column must not read as
			// branded, so this tints with the text color (black on a light
			// theme, white on a dark one) rather than with the palette.
			return alpha(theme.palette.text.primary, dark ? 0.05 : 0.06);
		case "current":
			return alpha(theme.palette.warning.main, dark ? 0.16 : 0.14);
		case "accent":
			return alpha(theme.palette.info.main, dark ? 0.18 : 0.08);
	}
};

const stickyTint = (
	theme: Theme,
	variant: "muted" | "current" | "accent",
): string => {
	const dark = theme.palette.mode === "dark";
	switch (variant) {
		case "muted":
			return alpha(theme.palette.text.primary, 0.11);
		case "current":
			return alpha(theme.palette.warning.main, dark ? 0.16 : 0.14);
		case "accent":
			return alpha(theme.palette.info.main, 0.2);
	}
};

/** Translucent tints for the cells that scroll (body cells). */
export const columnTintStyles = (theme: Theme) => ({
	[`&.${matrixClasses.columnMuted}`]: {
		backgroundColor: tint(theme, "muted"),
	},
	[`&.${matrixClasses.columnCurrent}`]: {
		backgroundColor: tint(theme, "current"),
	},
	[`&.${matrixClasses.columnAccent}`]: {
		backgroundColor: tint(theme, "accent"),
	},
});

/**
 * Opaque tints for the sticky cells: a gradient of one flat color, layered over
 * the opaque paper background, tints the cell without making it see-through.
 */
export const stickyColumnTintStyles = (
	theme: Theme,
	accentExtra?: Record<string, string>,
) => {
	const layer = (variant: "muted" | "current" | "accent") => ({
		backgroundImage: `linear-gradient(${stickyTint(theme, variant)}, ${stickyTint(
			theme,
			variant,
		)})`,
	});
	return {
		backgroundColor: theme.palette.background.paper,
		[`&.${matrixClasses.columnMuted}`]: layer("muted"),
		[`&.${matrixClasses.columnCurrent}`]: layer("current"),
		[`&.${matrixClasses.columnAccent}`]: { ...layer("accent"), ...accentExtra },
	};
};

/** One divider line on the right and the bottom of a cell. */
export const cellBorders = (theme: Theme) => ({
	borderRight: `1px solid ${theme.palette.divider}`,
	borderBottom: `1px solid ${theme.palette.divider}`,
});
