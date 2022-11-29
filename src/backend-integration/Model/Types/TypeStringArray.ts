import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";

/**
 * Type to handle string arrays (e.g. id arrays)
 */
abstract class TypeStringArray implements Type<string[]> {
	abstract render(params: ModelRenderParams<string[]>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return null;
	}

	getDefaultValue(): string[] {
		return [];
	}

	stringify(value: string[]): string {
		return value.join(",");
	}

	deserialize = (value: unknown): string[] => {
		if (value == null) return [];
		if (!Array.isArray(value)) throw new Error("data type mismatch");
		return value as string[];
	};
}

export default TypeStringArray;
