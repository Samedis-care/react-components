import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

/**
 * Type to handle strings
 */
abstract class TypeString implements Type<string> {
	protected multiline: boolean;

	constructor(multiline = false) {
		this.multiline = multiline;
	}

	abstract render(params: ModelRenderParams<string>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return "string";
	}

	getDefaultValue(): string {
		return "";
	}

	stringify(value: string): string {
		return value;
	}
}

export default TypeString;
