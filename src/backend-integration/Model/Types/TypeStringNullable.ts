import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

/**
 * Type for strings that can be unset (null), e.g. backend fields without a default
 */
abstract class TypeStringNullable implements Type<string | null> {
	protected multiline: boolean;

	constructor(multiline = false) {
		this.multiline = multiline;
	}

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
		return value ?? "";
	}
}

export default TypeStringNullable;
