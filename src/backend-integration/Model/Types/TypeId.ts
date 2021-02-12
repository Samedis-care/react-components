import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

/**
 * Type to handle an id
 */
abstract class TypeId implements Type<string | null> {
	abstract render(params: ModelRenderParams<string | null>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return "string";
	}

	getDefaultValue(): string | null {
		return null;
	}

	stringify(value: string | null): string {
		return value ?? "null";
	}
}

export default TypeId;
