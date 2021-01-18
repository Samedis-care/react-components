import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

/**
 * Type to handle currencies
 * @type [string (ISO 4217 3 letter code), number] | null if not set
 */
abstract class TypeCurrency implements Type<[string, number] | null> {
	abstract render(
		params: ModelRenderParams<[string, number] | null>
	): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return "currency";
	}

	getDefaultValue(): [string, number] | null {
		return null;
	}

	stringify(value: [string, number] | null): string {
		return value === null ? "" : `${value[1].toString()} ${value[0]}`;
	}
}

export default TypeCurrency;
