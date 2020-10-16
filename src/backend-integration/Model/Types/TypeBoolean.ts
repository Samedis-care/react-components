import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import ccI18n from "../../../i18n";

/**
 * Type for booleans
 */
abstract class TypeBoolean implements Type<boolean> {
	abstract render(params: ModelRenderParams<boolean>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return "boolean";
	}

	getDefaultValue(): boolean {
		return false;
	}

	stringify(value: boolean): string {
		return value
			? ccI18n.t("backend-integration.model.types.boolean.true")
			: ccI18n.t("backend-integration.model.types.boolean.false");
	}
}

export default TypeBoolean;
