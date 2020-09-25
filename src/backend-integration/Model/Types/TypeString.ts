import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

abstract class TypeString implements Type<string> {
	abstract render(params: ModelRenderParams<string>): React.ReactElement;

	verify(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return "string";
	}

	getDefaultValue(): string {
		return "";
	}
}

export default TypeString;
