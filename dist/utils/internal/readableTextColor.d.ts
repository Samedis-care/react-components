import type { Theme } from "@mui/material";
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
