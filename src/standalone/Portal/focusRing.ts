import { buttonBaseClasses, CSSObject } from "@mui/material";

/**
 * Keyboard focus ring of the Portal's menu entries and buttons: a 2px outline
 * inside the element while it has keyboard focus (MUI's `Mui-focusVisible`), so a
 * scrolling menu cannot clip it. Forced-colors mode keeps outlines, unlike the
 * focus tint and ripple.
 * @param color The outline color; it needs 3:1 against what the element is drawn on
 */
const focusRing = (color: string): CSSObject => ({
	[`&.${buttonBaseClasses.focusVisible}`]: {
		outline: `2px solid ${color}`,
		outlineOffset: -2,
	},
});

export default focusRing;
