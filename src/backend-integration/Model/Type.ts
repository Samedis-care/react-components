import React from "react";
import { ModelRenderParams } from "./index";
import FilterType from "./FilterType";

interface Type<T> {
	/**
	 * Validates the given value
	 * @param value The value to verify
	 * @returns An error string or null if no validation error occurred
	 */
	validate(value: T): string | null;

	/**
	 * Renders the value
	 * @param params The render parameters
	 */
	render(params: ModelRenderParams<T>): React.ReactElement;

	/**
	 * Gets the filter type for grid sorting
	 */
	getFilterType(): FilterType;

	/**
	 * Gets the default value for the type
	 * @returns an empty value or null
	 */
	getDefaultValue(): T;
}

export default Type;
