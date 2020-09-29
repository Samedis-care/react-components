import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

export interface EnumValue {
	value: string;
	getLabel: () => string;
}

abstract class TypeEnum implements Type<string> {
	protected values: EnumValue[];

	constructor(values: EnumValue[]) {
		this.values = values;
	}

	abstract render(params: ModelRenderParams<string>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return "string";
	}

	getDefaultValue(): string {
		return this.values[0].value;
	}
}

export default TypeEnum;
