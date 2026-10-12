import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

export interface EnumValue<T extends string = string> {
	value: T;
	getLabel: () => string;
	invisible?: boolean;
	/**
	 * Hide the entry in as grid filter enum selection (overwrites invisible)
	 * @default to value of invisible
	 */
	invisibleInGridFilter?: boolean;
	disabled?: boolean;
	isDivider?: boolean;
}

/**
 * Type for enums: the value is one of the values. An enum that can be empty declares `""` as a
 * value (`TypeEnum<X | "">`), nothing adds it implicitly.
 */
abstract class TypeEnum<T extends string = string> implements Type<T> {
	protected values: EnumValue<T>[];
	protected defaultValue: T;
	protected numericMode: boolean;

	/**
	 * @param values The values
	 * @param defaultValue The value of a new record: one of the values, or `""` for an enum that
	 * declares it, which then starts empty
	 * @param numericMode Send the values to the server as numbers
	 */
	constructor(
		values: EnumValue<T>[],
		defaultValue: NoInfer<T>,
		numericMode = false,
	) {
		this.values = values;
		this.defaultValue = defaultValue;
		this.numericMode = numericMode;
	}

	abstract render(params: ModelRenderParams<T>): React.ReactElement;

	validate(value: T): string | null {
		if (value === "") return null;

		return this.values.find((entry) => entry.value === value)
			? null
			: "Invalid Enum Value detected!"; // Developer warning
	}

	getFilterType(): FilterType {
		return "enum";
	}

	// an arrow: model code calls it detached
	getDefaultValue = (): T => this.defaultValue;

	stringify(value: T): string {
		if (!value) return "";

		return (
			this.values.find((entry) => entry.value === value)?.getLabel() ||
			"Invalid Enum Value detected!"
		);
	}

	// the server's value is one of the values; no value (null) is the default value, which is
	// `""` for an enum that declares it
	deserialize = (value: unknown): T => {
		if (value === null || value === undefined) return this.defaultValue;
		if (typeof value === "number") return value.toString() as T;
		if (typeof value === "string") return value as T;
		throw new Error("Unsupported data");
	};

	serialize = (value: T): string | number | null =>
		value === "" ? null : this.numericMode ? parseInt(value) : value;

	getEnumValues = (): EnumValue<T>[] => this.values;
}

export default TypeEnum;
