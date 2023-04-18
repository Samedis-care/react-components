import { decomposeColor, hslToRgb } from "@mui/material/styles";

// map color keyword -> #rrggbbaa
export const colorLookupMap: Record<string, string> = {
	aliceblue: "#f0f8ffff",
	antiquewhite: "#faebd7ff",
	aqua: "#00ffffff",
	aquamarine: "#7fffd4ff",
	azure: "#f0ffffff",
	beige: "#f5f5dcff",
	bisque: "#ffe4c4ff",
	black: "#000000ff",
	blanchedalmond: "#ffebcdff",
	blue: "#0000ffff",
	blueviolet: "#8a2be2ff",
	brown: "#a52a2aff",
	burlywood: "#deb887ff",
	cadetblue: "#5f9ea0ff",
	chartreuse: "#7fff00ff",
	chocolate: "#d2691eff",
	coral: "#ff7f50ff",
	cornflowerblue: "#6495edff",
	cornsilk: "#fff8dcff",
	crimson: "#dc143cff",
	cyan: "#00ffffff",
	darkblue: "#00008bff",
	darkcyan: "#008b8bff",
	darkgoldenrod: "#b8860bff",
	darkgray: "#a9a9a9ff",
	darkgreen: "#006400ff",
	darkgrey: "#a9a9a9ff",
	darkkhaki: "#bdb76bff",
	darkmagenta: "#8b008bff",
	darkolivegreen: "#556b2fff",
	darkorange: "#ff8c00ff",
	darkorchid: "#9932ccff",
	darkred: "#8b0000ff",
	darksalmon: "#e9967aff",
	darkseagreen: "#8fbc8fff",
	darkslateblue: "#483d8bff",
	darkslategray: "#2f4f4fff",
	darkslategrey: "#2f4f4fff",
	darkturquoise: "#00ced1ff",
	darkviolet: "#9400d3ff",
	deeppink: "#ff1493ff",
	deepskyblue: "#00bfffff",
	dimgray: "#696969ff",
	dimgrey: "#696969ff",
	dodgerblue: "#1e90ffff",
	firebrick: "#b22222ff",
	floralwhite: "#fffaf0ff",
	forestgreen: "#228b22ff",
	fuchsia: "#ff00ffff",
	gainsboro: "#dcdcdcff",
	ghostwhite: "#f8f8ffff",
	gold: "#ffd700ff",
	goldenrod: "#daa520ff",
	gray: "#808080ff",
	green: "#008000ff",
	greenyellow: "#adff2fff",
	grey: "#808080ff",
	honeydew: "#f0fff0ff",
	hotpink: "#ff69b4ff",
	indianred: "#cd5c5cff",
	indigo: "#4b0082ff",
	ivory: "#fffff0ff",
	khaki: "#f0e68cff",
	lavender: "#e6e6faff",
	lavenderblush: "#fff0f5ff",
	lawngreen: "#7cfc00ff",
	lemonchiffon: "#fffacdff",
	lightblue: "#add8e6ff",
	lightcoral: "#f08080ff",
	lightcyan: "#e0ffffff",
	lightgoldenrodyellow: "#fafad2ff",
	lightgray: "#d3d3d3ff",
	lightgreen: "#90ee90ff",
	lightgrey: "#d3d3d3ff",
	lightpink: "#ffb6c1ff",
	lightsalmon: "#ffa07aff",
	lightseagreen: "#20b2aaff",
	lightskyblue: "#87cefaff",
	lightslategray: "#778899ff",
	lightslategrey: "#778899ff",
	lightsteelblue: "#b0c4deff",
	lightyellow: "#ffffe0ff",
	lime: "#00ff00ff",
	limegreen: "#32cd32ff",
	linen: "#faf0e6ff",
	magenta: "#ff00ffff",
	maroon: "#800000ff",
	mediumaquamarine: "#66cdaaff",
	mediumblue: "#0000cdff",
	mediumorchid: "#ba55d3ff",
	mediumpurple: "#9370dbff",
	mediumseagreen: "#3cb371ff",
	mediumslateblue: "#7b68eeff",
	mediumspringgreen: "#00fa9aff",
	mediumturquoise: "#48d1ccff",
	mediumvioletred: "#c71585ff",
	midnightblue: "#191970ff",
	mintcream: "#f5fffaff",
	mistyrose: "#ffe4e1ff",
	moccasin: "#ffe4b5ff",
	navajowhite: "#ffdeadff",
	navy: "#000080ff",
	oldlace: "#fdf5e6ff",
	olive: "#808000ff",
	olivedrab: "#6b8e23ff",
	orange: "#ffa500ff",
	orangered: "#ff4500ff",
	orchid: "#da70d6ff",
	palegoldenrod: "#eee8aaff",
	palegreen: "#98fb98ff",
	paleturquoise: "#afeeeeff",
	palevioletred: "#db7093ff",
	papayawhip: "#ffefd5ff",
	peachpuff: "#ffdab9ff",
	peru: "#cd853fff",
	pink: "#ffc0cbff",
	plum: "#dda0ddff",
	powderblue: "#b0e0e6ff",
	purple: "#800080ff",
	rebeccapurple: "#663399ff",
	red: "#ff0000ff",
	rosybrown: "#bc8f8fff",
	royalblue: "#4169e1ff",
	saddlebrown: "#8b4513ff",
	salmon: "#fa8072ff",
	sandybrown: "#f4a460ff",
	seagreen: "#2e8b57ff",
	seashell: "#fff5eeff",
	sienna: "#a0522dff",
	silver: "#c0c0c0ff",
	skyblue: "#87ceebff",
	slateblue: "#6a5acdff",
	slategray: "#708090ff",
	slategrey: "#708090ff",
	snow: "#fffafaff",
	springgreen: "#00ff7fff",
	steelblue: "#4682b4ff",
	tan: "#d2b48cff",
	teal: "#008080ff",
	thistle: "#d8bfd8ff",
	tomato: "#ff6347ff",
	transparent: "#00000000",
	turquoise: "#40e0d0ff",
	violet: "#ee82eeff",
	wheat: "#f5deb3ff",
	white: "#ffffffff",
	whitesmoke: "#f5f5f5ff",
	yellow: "#ffff00ff",
	yellowgreen: "#9acd32ff",
};

/**
 * Converts color to RGBA array
 * @param color The color
 * @return undefined if color cannot be parsed, rgba array on success. alpha channel is 0.0 - 1.0
 */
const colorToRgba = (
	color: string
): [r: number, g: number, b: number, a: number] | undefined => {
	// lookup color keywords and convert to #rrggbbaa
	if (color.toLowerCase() in colorLookupMap) {
		color = colorLookupMap[color.toLowerCase()];
	}

	// decode #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), hsla() using JS
	// https://github.com/mui/material-ui/blob/v4.12.3/packages/material-ui/src/styles/colorManipulator.js#L102
	try {
		let decoded = decomposeColor(color);
		if (["hsl", "hsla"].includes(decoded.type)) {
			decoded = decomposeColor(hslToRgb(color));
		}
		if (decoded.values.length === 3) {
			return [...decoded.values, 1.0];
		} else {
			return decoded.values;
		}
	} catch (e) {
		// format not supported
	}

	// Fallback (using canvas)
	// credits: https://stackoverflow.com/a/19366389
	// Jest patch (canvas not supported), not used in prod
	if (process && process.env && process.env.JEST_WORKER_ID)
		return [0, 0, 0, 1.0]; // black
	if (process && process.env && process.env.NODE_ENV === "development") {
		// eslint-disable-next-line no-console
		console.warn(
			"[Components-Care] colorToRgba (slow/unreliable) fallback triggered with color input:",
			color
		);
	}

	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Failed getting Canvas 2D context");
	ctx.clearRect(0, 0, 1, 1);
	// In order to detect invalid values,
	// we can't rely on col being in the same format as what fillStyle is computed as,
	// but we can ask it to implicitly compute a normalized value twice and compare.
	ctx.fillStyle = "#000";
	ctx.fillStyle = color;
	const computed = ctx.fillStyle;
	ctx.fillStyle = "#fff";
	ctx.fillStyle = color;
	if (computed !== ctx.fillStyle) {
		return; // invalid color
	}
	ctx.fillRect(0, 0, 1, 1);
	const ret: number[] = [];
	ctx.getImageData(0, 0, 1, 1).data.forEach((val) => ret.push(val));
	ret[3] = Math.round((ret[3] / 0xff) * 1000) / 1000; // 0 - 255 => 0.0 - 1.0
	return ret as [r: number, g: number, b: number, a: number];
};

export default colorToRgba;
