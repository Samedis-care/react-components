import type { SxProps, Theme } from "@mui/material";

/** One entry of an `sx` array */
type SxEntry = Exclude<SxProps<Theme>, ReadonlyArray<unknown>> | boolean;

/**
 * Whether an `sx` is an array of styles
 * @param sx The `sx`
 * @returns true for an array
 */
const isSxArray = (sx: SxProps<Theme>): sx is readonly SxEntry[] =>
	Array.isArray(sx);

/**
 * Puts the library's styles in front of a caller's `sx`, so that the caller's
 * come after them and win.
 * @param style The library's styles
 * @param sx The caller's `sx` (a style object, a function of the theme or an
 * array of them), or undefined for none
 * @returns An `sx` array: `style`, then the caller's entries
 */
const prependSx = (
	style: SxEntry,
	sx: SxProps<Theme> | undefined,
): SxEntry[] => [style, ...(sx === undefined ? [] : isSxArray(sx) ? sx : [sx])];

export default prependSx;
