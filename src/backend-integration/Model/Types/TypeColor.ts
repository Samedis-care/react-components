import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import ccI18n from "../../../i18n";

/** `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` */
const HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
/**
 * `rgb(…)`, `rgba(…)`, `hsl(…)` or `hsla(…)`: lowercase, with no space before
 * the parenthesis
 */
const FUNCTION_COLOR = /^(rgba?|hsla?)\(([^()]*)\)$/;
/** One value of a color function: a number, with a percent sign or without */
const COLOR_VALUE = /^(\d+(?:\.\d+)?|\.\d+)(%?)$/;

/**
 * Whether the text is a color that MUI's palette and color functions read,
 * and read as CSS does
 * @param color The text
 * @returns true for `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` (hex digits in
 * either case), `rgb()`/`rgba()` with three comma-separated numbers from 0 to
 * 255 and an optional alpha from 0 to 1, and `hsl()`/`hsla()` with a hue from
 * 0 to 360, saturation and lightness in percent and an optional alpha; false
 * for anything else, such as a color name, a space-separated `rgb(8 105 179)`
 * or text with spaces around it
 */
const isPaletteColor = (color: string): boolean => {
	if (HEX_COLOR.test(color)) return true;
	const fn = FUNCTION_COLOR.exec(color);
	if (!fn) return false;
	const hsl = fn[1].startsWith("hsl");
	const values = fn[2]
		.split(",")
		.map((value) => COLOR_VALUE.exec(value.trim()));
	if (values.length !== 3 && values.length !== 4) return false;
	return values.every((value, index) => {
		if (!value) return false;
		const number = parseFloat(value[1]);
		const percent = value[2] === "%";
		if (index === 3) return !percent && number <= 1; // alpha
		if (!hsl) return !percent && number <= 255; // red, green, blue
		if (index === 0) return !percent && number <= 360; // hue
		return percent && number <= 100; // saturation, lightness
	});
};

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
abstract class TypeColor implements Type<string> {
	abstract render(params: ModelRenderParams<string>): React.ReactElement;

	/**
	 * @param value The color text, `""` or `null` for none
	 * @returns The message for text that is not a color in one of the formats
	 * above, `null` for a color or for none
	 */
	validate(value: string | null): string | null {
		if (!value || isPaletteColor(value)) return null;
		return ccI18n.t("backend-integration.model.types.color.validation-error");
	}

	getFilterType(): FilterType {
		return null;
	}

	getDefaultValue(): string {
		return "";
	}

	stringify(value: string): string {
		return value;
	}
}

export default TypeColor;
