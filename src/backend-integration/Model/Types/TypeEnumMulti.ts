import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { EnumValue } from "./TypeEnum";

/**
 * Enum type with multi-select capability
 */
abstract class TypeMultiEnum implements Type<string[]> {
	protected values: EnumValue[];

	constructor(values: EnumValue[]) {
		this.values = values;
	}

	abstract render(params: ModelRenderParams<string[]>): React.ReactElement;

	validate(values: string[]): string | null {
		if (values.length === 0) return null;

		return values.find((value) =>
			this.values.find((entry) => entry.value === value)
		)
			? null
			: "Invalid Enum Value detected!"; // Developer warning
	}

	getFilterType(): FilterType {
		return "string";
	}

	getDefaultValue(): string[] {
		return [];
	}
}

export default TypeMultiEnum;
