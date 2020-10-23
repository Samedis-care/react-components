import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { normalizeDate } from "./Utils/DateUtils";

/**
 * Type for non-nullable dates
 */
abstract class TypeDate implements Type<Date> {
	abstract render(params: ModelRenderParams<Date>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return "date";
	}

	getDefaultValue(): Date {
		return normalizeDate(new Date());
	}

	stringify(value: Date): string {
		return value.toLocaleString();
	}

	serialize = (value: Date): unknown => {
		return value.toISOString();
	};

	deserialize = (value: unknown): Date => {
		return new Date(value as string);
	};
}

export default TypeDate;
