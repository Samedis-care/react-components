export declare const colorLookupMap: Record<string, string>;
/** The channels colorToRgba returns: red, green and blue 0-255, alpha 0-1 */
type Rgba = [r: number, g: number, b: number, a: number];
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
declare const colorToRgba: (color: string) => Rgba | undefined;
export default colorToRgba;
