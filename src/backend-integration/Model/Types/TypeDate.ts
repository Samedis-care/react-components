import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { normalizeDate } from "./Utils/DateUtils";
import ccI18n from "../../../i18n";
import moment from "moment";
import i18n from "../../../i18n";

/**
 * Type for non-nullable dates
 */
abstract class TypeDate implements Type<Date> {
	protected error = "";

	abstract render(params: ModelRenderParams<Date>): React.ReactElement;

	validate(): string | null {
		return this.error || null;
	}

	getFilterType(): FilterType {
		return "date";
	}

	getDefaultValue(): Date {
		return normalizeDate(new Date());
	}

	stringify(value: Date): string {
		return value.toLocaleDateString(i18n.language);
	}

	serialize = (value: Date): unknown => {
		return value.toISOString();
	};

	deserialize = (value: unknown): Date => {
		return new Date(value as string);
	};

	/**
	 * Formatting helper used in date renderers
	 * @param value The user input
	 * @returns The formatted value
	 */
	static format = (value: string): string => {
		// convert format to __/__/____
		let format = moment()
			.locale(ccI18n.language)
			.localeData()
			.longDateFormat("L")
			.replace(/[DMY]/gm, "_");

		// get numeric values from user input
		const values = value.replace(/([^0-9])/gm, "");

		if (values.length === 0) return "";

		// replace _ in format with user input values
		let vI = 0;
		for (let i = 0; i < format.length && vI < values.length; ++i) {
			if (format[i] === "_") {
				format = format.replace("_", values[vI++]);
			}
		}

		return format;
	};
}

export default TypeDate;
