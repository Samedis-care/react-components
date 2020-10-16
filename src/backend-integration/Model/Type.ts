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

	/**
	 * Turns value into string
	 * @param value The value to stringify
	 */
	stringify(value: T): string;

	/**
	 * Optional serialization handler. Turns value into a JSON serializable value.
	 * @param value The raw value
	 * @returns The JSON serializable value
	 */
	serialize?: (value: T) => unknown | Promise<unknown>;

	/**
	 * Optional deserialization handler. Turns value into a raw value
	 * @param value The JSON serialized value
	 * @returns The raw value (of type T)
	 */
	deserialize?: (value: unknown) => T | Promise<T>;
}

export default Type;
