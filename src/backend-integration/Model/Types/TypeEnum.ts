import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

export interface EnumValue {
	value: string;
	getLabel: () => string;
	invisible?: boolean;
	disabled?: boolean;
	isDivider?: boolean;
}

abstract class TypeEnum implements Type<string> {
	protected values: EnumValue[];
	protected numericMode: boolean;

	constructor(values: EnumValue[], numericMode = false) {
		this.values = values;
		this.numericMode = numericMode;
	}

	abstract render(params: ModelRenderParams<string>): React.ReactElement;

	validate(value: string): string | null {
		if (value === "") return null;

		return this.values.find((entry) => entry.value === value)
			? null
			: "Invalid Enum Value detected!"; // Developer warning
	}

	getFilterType(): FilterType {
		return "enum";
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
		if (typeof value === "number") return value.toString();
		if (typeof value === "string") return value;
		throw new Error("Unsupported data");
	};

	serialize = (value: string): string | number | null =>
		value === "" ? null : this.numericMode ? parseInt(value) : value;

	getEnumValues = (): EnumValue[] => this.values;
}

export default TypeEnum;
