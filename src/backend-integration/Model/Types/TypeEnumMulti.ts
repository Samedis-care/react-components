import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { EnumValue } from "./TypeEnum";
import { MultiSelectorData } from "../../../standalone";

export type AdvancedMultiEnumValue<T extends string = string> = Omit<
	MultiSelectorData,
	"label" | "value"
> &
	Pick<EnumValue<T>, "value" | "getLabel" | "invisible">;

/**
 * Enum type with multi-select capability
 */
abstract class TypeMultiEnum<T extends string = string> implements Type<T[]> {
	protected values: EnumValue<T>[];

	constructor(values: EnumValue<T>[]) {
		this.values = values;
	}

	abstract render(params: ModelRenderParams<T[]>): React.ReactElement;

	validate(values: T[]): string | null {
		if (values.length === 0) return null;

		return values.find((value) =>
			this.values.find((entry) => entry.value === value),
		)
			? null
			: "Invalid Enum Value detected!"; // Developer warning
	}

	getFilterType(): FilterType {
		return "enum";
	}

	getDefaultValue(): T[] {
		return [];
	}

	stringify(values: T[]): string {
		return values
			.map(
				(value) =>
					this.values.find((val) => val.value === value)?.getLabel() ||
					"Invalid Enum Value detected!",
			)
			.join(", ");
	}

	getEnumValues = (): EnumValue<T>[] => this.values;

	// the server's values are some of the values
	deserialize = (value: unknown): T[] => (value as T[] | null) ?? [];
}

export default TypeMultiEnum;
