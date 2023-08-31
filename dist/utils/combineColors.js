/**
 * Combines two colors
 * @param color1 The first color (has to be solid)
 * @param color2 The second color (has to be transparent)
 * @returns A rgba array (usage for CSS: "rgba(" + combineColors(...).join() + ")")
 */
import colorToRgba from "./colorToRgba";
const combineColors = (color1, color2) => {
    const color1Decoded = colorToRgba(color1);
    const color2Decoded = colorToRgba(color2);
    if (!color1Decoded || !color2Decoded)
        throw new Error("Failed decoding colors");
    const [r1, g1, b1, a1] = color1Decoded;
    const [r2, g2, b2, a2] = color2Decoded;
    if (a2 === 0)
        return color1Decoded; // 2nd color not visible, avoid division by zero when mixing
    const mix = [0, 0, 0, 0];
    const aR = (mix[3] = 1 - (1 - a2) * (1 - a1)); // alpha
    mix[0] = Math.round((r2 * a2) / aR + (r1 * a1 * (1 - a2)) / aR); // red
    mix[1] = Math.round((g2 * a2) / aR + (g1 * a1 * (1 - a2)) / aR); // green
    mix[2] = Math.round((b2 * a2) / aR + (b1 * a1 * (1 - a2)) / aR); // blue
    return mix;
};
export default combineColors;
