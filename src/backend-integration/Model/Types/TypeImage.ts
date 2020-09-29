import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

abstract class TypeImage implements Type<string> {
	abstract render(params: ModelRenderParams<string>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return null;
	}

	getDefaultValue(): string {
		return "";
	}
}

export default TypeImage;
