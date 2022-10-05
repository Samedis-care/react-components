import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import ccI18n from "../../../i18n";
import i18n from "../../../i18n";

/**
 * Type for nullable dates
 */
abstract class TypeDateTimeNullable implements Type<Date | null> {
	protected error = "";

	abstract render(params: ModelRenderParams<Date | null>): React.ReactElement;

	validate(): string | null {
		return this.error || null;
	}

	getFilterType(): FilterType {
		return "datetime";
	}

	getDefaultValue(): Date | null {
		return null;
	}

	stringify(value: Date | null): string {
		return value
			? value.toLocaleString(i18n.language)
			: ccI18n.t("backend-integration.model.types.date-nullable.not-set");
	}

	serialize = (value: Date | null): unknown => {
		if (!value) return null;
		return value.toISOString();
	};

	deserialize = (value: unknown): Date | null => {
		if (value) return new Date(value as string);
		return null;
	};
}

export default TypeDateTimeNullable;
