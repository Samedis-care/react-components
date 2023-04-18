/**
 * Combines two colors
 * @param color1 The first color (has to be solid)
 * @param color2 The second color (has to be transparent)
 * @returns A rgba array (usage for CSS: "rgba(" + combineColors(...).join() + ")")
 */
import colorToRgba from "./colorToRgba";
var combineColors = function (color1, color2) {
    var color1Decoded = colorToRgba(color1);
    var color2Decoded = colorToRgba(color2);
    if (!color1Decoded || !color2Decoded)
        throw new Error("Failed decoding colors");
    var r1 = color1Decoded[0], g1 = color1Decoded[1], b1 = color1Decoded[2], a1 = color1Decoded[3];
    var r2 = color2Decoded[0], g2 = color2Decoded[1], b2 = color2Decoded[2], a2 = color2Decoded[3];
    if (a2 === 0)
        return color1Decoded; // 2nd color not visible, avoid division by zero when mixing
    var mix = [0, 0, 0, 0];
    var aR = (mix[3] = 1 - (1 - a2) * (1 - a1)); // alpha
    mix[0] = Math.round((r2 * a2) / aR + (r1 * a1 * (1 - a2)) / aR); // red
    mix[1] = Math.round((g2 * a2) / aR + (g1 * a1 * (1 - a2)) / aR); // green
    mix[2] = Math.round((b2 * a2) / aR + (b1 * a1 * (1 - a2)) / aR); // blue
    return mix;
};
export default combineColors;
