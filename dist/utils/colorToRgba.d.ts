import { NamedColor } from "csstype";
export declare const colorLookupMap: Record<NamedColor, string>;
/**
 * Converts color to RGBA array
 * @param color The color
 * @return undefined if color cannot be parsed, rgba array on success. alpha channel is 0.0 - 1.0
 */
declare const colorToRgba: (color: string) => [r: number, g: number, b: number, a: number] | undefined;
export default colorToRgba;
