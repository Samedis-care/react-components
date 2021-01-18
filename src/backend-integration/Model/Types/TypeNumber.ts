import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

/**
 * Type to handle numbers
 * @type number if set, null if not set
 */
abstract class TypeNumber implements Type<number | null> {
	abstract render(params: ModelRenderParams<number | null>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return "number";
	}

	getDefaultValue(): number | null {
		return null;
	}

	stringify(value: number | null): string {
		return value === null ? "" : value.toString();
	}
}

export default TypeNumber;
