import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

export interface EnumValue {
	value: string;
	getLabel: () => string;
	invisible?: boolean;
}

abstract class TypeEnum implements Type<string> {
	protected values: EnumValue[];

	constructor(values: EnumValue[]) {
		this.values = values;
	}

	abstract render(params: ModelRenderParams<string>): React.ReactElement;

	validate(value: string): string | null {
		if (value === "") return null;

		return this.values.find((entry) => entry.value === value)
			? null
			: "Invalid Enum Value detected!"; // Developer warning
	}

	getFilterType(): FilterType {
		return "string";
	}

	getDefaultValue(): string {
		return "";
	}

	stringify(value: string): string {
		if (!value) return "";

		return (
			this.values.find((entry) => entry.value === value)?.getLabel() ||
			"Invalid Enum Value detected!"
		);
	}

	// handle null/undefined values
	deserialize = (value: unknown): string => {
		if (value === null || value === undefined) return "";
		if (typeof value === "string") return value;
		throw new Error("Unsupported data");
	};

	serialize = (value: string): string | null => (value === "" ? null : value);
}

export default TypeEnum;
