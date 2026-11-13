import type { Theme } from "@mui/material";
/** WCAG 1.4.3 Contrast (Minimum) for text of normal size */
declare const TEXT_CONTRAST = 4.5;
type Rgba = [r: number, g: number, b: number, a: number];
/**
 * Parses a CSS color of the formats MUI's palette uses
 * @param color A hex, `rgb()`/`rgba()` or `hsl()`/`hsla()` color
 * @returns The channels (0-255) and alpha (0-1), or `undefined` for anything else
 * (CSS variables, keywords, `color()`)
 */
declare const parse: (color: string) => Rgba | undefined;
/**
 * Relative luminance as WCAG defines it
 * @param rgb The color's channels, 0-255
 * @returns The luminance, 0 (black) to 1 (white)
 */
declare const luminance: ([r, g, b]: readonly number[]) => number;
/**
 * The contrast ratio of two luminances, as WCAG defines it
 * @param a One luminance
 * @param b The other luminance
 * @returns The ratio, 1 to 21
 */
declare const contrast: (a: number, b: number) => number;
/**
 * A text color as close to `color` as the theme's backgrounds allow.
 *
 * Returns `color` itself when it already reaches 4.5:1 against both
 * `palette.background.paper` and `palette.background.default`. Otherwise it
 * darkens it (on light backgrounds) or lightens it (on dark ones) by the
 * smallest amount that does, so the hue of a state color such as
 * `palette.warning.main` is kept while its text becomes readable. A color or
 * background this cannot parse (a CSS variable, a keyword) is returned as is.
 * @param theme The theme whose backgrounds the text sits on
 * @param color The color the text should have
 * @returns The color to render the text in
 */
declare const readableTextColor: (theme: Theme, color: string) => string;
export default readableTextColor;
export { TEXT_CONTRAST, type Rgba, parse as parseColor, luminance, contrast };
