import type { Theme } from "@mui/material";
import {
	darken,
	decomposeColor,
	hslToRgb,
	lighten,
} from "@mui/material/styles";

/** WCAG 1.4.3 Contrast (Minimum) for text of normal size */
const TEXT_CONTRAST = 4.5;

type Rgba = [r: number, g: number, b: number, a: number];

/**
 * Parses a CSS color of the formats MUI's palette uses
 * @param color A hex, `rgb()`/`rgba()` or `hsl()`/`hsla()` color
 * @returns The channels (0-255) and alpha (0-1), or `undefined` for anything else
 * (CSS variables, keywords, `color()`)
 */
const parse = (color: string): Rgba | undefined => {
	try {
		let decoded = decomposeColor(color);
		if (decoded.type === "hsl" || decoded.type === "hsla") {
			decoded = decomposeColor(hslToRgb(color));
		}
		if (decoded.type !== "rgb" && decoded.type !== "rgba") return undefined;
		const [r, g, b, a = 1] = decoded.values;
		return [r, g, b, a];
	} catch {
		return undefined;
	}
};

/**
 * Relative luminance as WCAG defines it
 * @param rgb The color's channels, 0-255
 * @returns The luminance, 0 (black) to 1 (white)
 */
const luminance = ([r, g, b]: readonly number[]): number => {
	const channel = (value: number) => {
		const c = value / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/**
 * The contrast ratio of two luminances, as WCAG defines it
 * @param a One luminance
 * @param b The other luminance
 * @returns The ratio, 1 to 21
 */
const contrast = (a: number, b: number): number =>
	(Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

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
const readableTextColor = (theme: Theme, color: string): string => {
	const text = parse(color);
	const backgrounds = [
		theme.palette.background.paper,
		theme.palette.background.default,
	].map(parse);
	if (!text || backgrounds.some((background) => !background)) return color;
	const backgroundLuminances = (backgrounds as Rgba[]).map(luminance);

	/** The lowest contrast of a candidate against the backgrounds, laid over each */
	const worstContrast = (candidate: Rgba): number =>
		Math.min(
			...(backgrounds as Rgba[]).map((background, index) => {
				const [r, g, b, a] = candidate;
				const shown = [r, g, b].map(
					(channel, i) => channel * a + background[i] * (1 - a),
				);
				return contrast(luminance(shown), backgroundLuminances[index]);
			}),
		);
	if (worstContrast(text) >= TEXT_CONTRAST) return color;

	// towards black on a light background, towards white on a dark one
	const shift =
		contrast(0, backgroundLuminances[0]) >= contrast(1, backgroundLuminances[0])
			? darken
			: lighten;
	// the smallest shift that reaches the ratio: contrast grows with the shift
	let low = 0;
	let high = 1;
	for (let step = 0; step < 12; step++) {
		const middle = (low + high) / 2;
		const candidate = parse(shift(color, middle));
		if (candidate && worstContrast(candidate) >= TEXT_CONTRAST) high = middle;
		else low = middle;
	}
	return shift(color, high);
};

export default readableTextColor;
export { TEXT_CONTRAST, type Rgba, parse as parseColor, luminance, contrast };
