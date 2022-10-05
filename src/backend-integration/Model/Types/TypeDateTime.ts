import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import i18n from "../../../i18n";

/**
 * Type for non-nullable dates with time
 */
abstract class TypeDateTime implements Type<Date> {
	protected error = "";

	abstract render(params: ModelRenderParams<Date>): React.ReactElement;

	validate(): string | null {
		return this.error || null;
	}

	getFilterType(): FilterType {
		return "datetime";
	}

	getDefaultValue(): Date {
		return new Date();
	}

	stringify(value: Date): string {
		return value.toLocaleString(i18n.language);
	}

	serialize = (value: Date): unknown => {
		return value.toISOString();
	};

	deserialize = (value: unknown): Date => {
		return new Date(value as string);
	};
}

export default TypeDateTime;
