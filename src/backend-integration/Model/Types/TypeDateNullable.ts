import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

abstract class TypeDateNullable implements Type<Date | null> {
	abstract render(params: ModelRenderParams<Date | null>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return "date";
	}

	getDefaultValue(): Date | null {
		return null;
	}
}

export default TypeDateNullable;
