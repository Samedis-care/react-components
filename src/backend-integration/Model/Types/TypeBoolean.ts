import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

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
}

export default TypeBoolean;
