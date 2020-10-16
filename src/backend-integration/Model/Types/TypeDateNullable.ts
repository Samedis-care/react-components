import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import ccI18n from "../../../i18n";

/**
 * Type for nullable dates
 */
abstract class TypeDateNullable implements Type<Date | null> {
	abstract render(params: ModelRenderParams<Date | null>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return "date";
	}

	getDefaultValue(): Date | null {
		return null;
	}

	stringify(value: Date | null): string {
		return value
			? value.toLocaleString()
			: ccI18n.t("backend-integration.model.types.date-nullable.not-set");
	}
}

export default TypeDateNullable;
