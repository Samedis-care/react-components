import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
/**
 * Type for a color, as CSS text: `#rrggbb`, `#rgb`, `#rrggbbaa`, `#rgba`,
 * `rgb()`, `rgba()`, `hsl()` or `hsla()`, the formats MUI's palette reads, so a
 * stored color can be passed to `createTheme`. `""` (and `null`) is no color.
 *
 * `validate` refuses any other text, a typo (`zzz`) as well as a color name
 * (`red`), with the message "Please enter a valid color, such as #336699" in
 * the library's language. It leaves no color alone: a field that needs one
 * gets `validate: validatePresence`. A color is stored as it was typed or
 * stored before (`#00788A`, `rgb(8, 105, 179)`); the picker reports lowercase
 * `#rrggbb`.
 */
declare abstract class TypeColor implements Type<string> {
    abstract render(params: ModelRenderParams<string>): React.ReactElement;
    /**
     * @param value The color text, `""` or `null` for none
     * @returns The message for text that is not a color in one of the formats
     * above, `null` for a color or for none
     */
    validate(value: string | null): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string;
    stringify(value: string): string;
}
export default TypeColor;
