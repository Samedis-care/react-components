// map color keyword -> #rrggbbaa
export const colorLookupMap = {
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
const COMPONENT_PATTERN = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)(%|deg|grad|rad|turn)?$/;
const parseComponent = (token) => {
    if (token === "none")
        return { value: 0, unit: "", none: true };
    const match = COMPONENT_PATTERN.exec(token);
    if (!match)
        return undefined;
    return { value: parseFloat(match[1]), unit: match[2] ?? "" };
};
/**
 * Splits the arguments of a color function into three components and an
 * alpha, in the legacy syntax (commas) or the modern one (spaces, "/ alpha")
 * @returns undefined if they are not three components and an optional alpha
 * (calc() and var() are not read either)
 */
const parseArguments = (args) => {
    const legacy = args.includes(",");
    let tokens;
    let alphaToken;
    if (legacy) {
        tokens = args.split(",").map((token) => token.trim());
        if (tokens.length === 4)
            alphaToken = tokens.pop();
    }
    else {
        const parts = args.split("/");
        if (parts.length > 2)
            return undefined;
        tokens = parts[0].trim().split(/\s+/);
        alphaToken = parts[1]?.trim();
    }
    if (tokens.length !== 3)
        return undefined;
    const components = [];
    for (const token of tokens) {
        const component = parseComponent(token);
        if (!component)
            return undefined;
        components.push(component);
    }
    const alpha = alphaToken === undefined
        ? { value: 1, unit: "" }
        : parseComponent(alphaToken);
    if (!alpha || (alpha.unit !== "" && alpha.unit !== "%"))
        return undefined;
    // none belongs to the modern syntax only
    if (legacy && (alpha.none || components.some((component) => component.none)))
        return undefined;
    return {
        legacy,
        components,
        alpha: alpha.unit === "%" ? alpha.value / 100 : alpha.value,
    };
};
/** A hue in degrees, from a number (degrees) or an angle */
const toDegrees = ({ value, unit }) => {
    switch (unit) {
        case "":
        case "deg":
            return value;
        case "grad":
            return value * 0.9;
        case "rad":
            return (value * 180) / Math.PI;
        case "turn":
            return value * 360;
        default:
            return undefined;
    }
};
/**
 * A percentage (or, in the modern syntax, a number meaning one) as 0-1
 */
const toFraction = ({ value, unit }, legacy) => unit === "%" || (unit === "" && !legacy) ? value / 100 : undefined;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
/** HSL to red, green and blue 0-1 (CSS Color 4, section 7.1) */
const hslToChannels = (hue, saturation, lightness) => {
    const sat = Math.max(0, saturation);
    const light = clamp(lightness, 0, 1);
    const channel = (n) => {
        const k = (((n + hue / 30) % 12) + 12) % 12;
        const a = sat * Math.min(light, 1 - light);
        return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [channel(0), channel(8), channel(4)];
};
/** a linear-light sRGB channel to the gamma-encoded one */
const encodeSrgb = (linear) => {
    const abs = Math.abs(linear);
    return abs > 0.0031308
        ? Math.sign(linear) * (1.055 * abs ** (1 / 2.4) - 0.055)
        : 12.92 * linear;
};
/**
 * Red, green and blue (0-1, not yet clamped) of a color function's
 * arguments, or undefined if the function or the arguments are not read here
 */
const functionChannels = (name, body) => {
    if (name === "color") {
        // color() has the modern syntax only
        if (body.includes(","))
            return undefined;
        const [space, ...rest] = body.trim().split(/\s+/);
        const args = parseArguments(rest.join(" "));
        if (!args)
            return undefined;
        const values = args.components.map(({ value, unit }) => unit === "%" ? value / 100 : unit === "" ? value : NaN);
        if (space === "srgb")
            return [values, args.alpha];
        if (space === "srgb-linear")
            return [values.map(encodeSrgb), args.alpha];
        // other spaces need a conversion: the canvas does that
        return undefined;
    }
    const args = parseArguments(body);
    if (!args)
        return undefined;
    const { legacy, components, alpha } = args;
    switch (name) {
        case "rgb":
        case "rgba": {
            const units = components.map((component) => component.unit);
            if (units.some((unit) => unit !== "" && unit !== "%"))
                return undefined;
            // the legacy syntax takes three numbers or three percentages
            if (legacy && new Set(units).size > 1)
                return undefined;
            return [
                components.map(({ value, unit }) => unit === "%" ? value / 100 : value / 255),
                alpha,
            ];
        }
        case "hsl":
        case "hsla":
        case "hwb": {
            if (name === "hwb" && legacy)
                return undefined;
            const hue = toDegrees(components[0]);
            const second = toFraction(components[1], legacy);
            const third = toFraction(components[2], legacy);
            if (hue === undefined || second === undefined || third === undefined)
                return undefined;
            if (name !== "hwb")
                return [hslToChannels(hue, second, third), alpha];
            const white = clamp(second, 0, 1);
            const black = clamp(third, 0, 1);
            if (white + black >= 1) {
                const gray = white / (white + black);
                return [[gray, gray, gray], alpha];
            }
            return [
                hslToChannels(hue, 1, 0.5).map((channel) => channel * (1 - white - black) + white),
                alpha,
            ];
        }
        default:
            return undefined;
    }
};
const HEX_PATTERN = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/;
/** #rgb, #rgba, #rrggbb and #rrggbbaa (lower case) */
const parseHex = (value) => {
    const match = HEX_PATTERN.exec(value);
    if (!match)
        return undefined;
    const digits = match[1].length > 4
        ? match[1]
        : Array.from(match[1], (digit) => digit + digit).join("");
    const bytes = Array.from({ length: digits.length / 2 }, (_, index) => parseInt(digits.slice(index * 2, index * 2 + 2), 16));
    return [
        bytes[0],
        bytes[1],
        bytes[2],
        // as MUI's hexToRgb rounds it
        bytes.length === 4 ? Math.round((bytes[3] / 255) * 1000) / 1000 : 1,
    ];
};
const FUNCTION_PATTERN = /^([a-z-]+)\((.*)\)$/;
/** rgb(), rgba(), hsl(), hsla(), hwb() and color(srgb | srgb-linear ...) */
const parseFunction = (value) => {
    const match = FUNCTION_PATTERN.exec(value);
    if (!match)
        return undefined;
    const parsed = functionChannels(match[1], match[2]);
    if (!parsed)
        return undefined;
    const [channels, alpha] = parsed;
    if ([...channels, alpha].some((number) => !Number.isFinite(number)))
        return undefined;
    return [
        Math.round(clamp(channels[0], 0, 1) * 255),
        Math.round(clamp(channels[1], 0, 1) * 255),
        Math.round(clamp(channels[2], 0, 1) * 255),
        clamp(alpha, 0, 1),
    ];
};
/**
 * Resolves a color by painting it on a canvas, so the browser reads it
 * @throws if there is no canvas (jsdom without the canvas package, a server)
 */
const resolveWithCanvas = (color) => {
    // credits: https://stackoverflow.com/a/19366389
    // Jest patch (canvas not supported), not used in prod
    if (typeof process !== "undefined" && process.env?.JEST_WORKER_ID)
        return [0, 0, 0, 1.0]; // black
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw new Error("Failed getting Canvas 2D context");
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
    const ret = [];
    ctx.getImageData(0, 0, 1, 1).data.forEach((val) => ret.push(val));
    ret[3] = Math.round((ret[3] / 0xff) * 1000) / 1000; // 0 - 255 => 0.0 - 1.0
    return ret;
};
/**
 * Converts a CSS color to its red, green, blue and alpha channels.
 * @param color Any CSS color. Keywords, hex (3, 4, 6 and 8 digits), rgb(),
 * rgba(), hsl() and hsla() (numbers, percentages, angle units and none, with
 * commas or spaces), hwb() and color() in the srgb and srgb-linear spaces
 * are read here. Anything else (lab(), lch(), oklab(), oklch(), color() in
 * another space, color-mix(), ...) is painted on a canvas, so it resolves
 * wherever the browser supports it, mapped into sRGB as the browser does.
 * @return [r, g, b, a]: red, green and blue 0-255 (rounded), alpha 0.0-1.0;
 * or undefined if the color cannot be resolved (a var(), currentcolor, an
 * invalid value)
 * @throws if the color needs the canvas and there is none (jsdom without the
 * canvas package, a server)
 * @remarks Under Jest a color that needs the canvas resolves to black.
 */
const colorToRgba = (color) => {
    const value = color.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(colorLookupMap, value))
        return parseHex(colorLookupMap[value]);
    // the color of the element it is used on, which the value alone cannot tell
    if (value === "currentcolor")
        return undefined;
    const parsed = value.startsWith("#") ? parseHex(value) : parseFunction(value);
    return parsed ?? resolveWithCanvas(color);
};
export default colorToRgba;
