import { ModelFieldName } from "./Model";
import Visibility from "./Visibility";
import React from "react";

interface RenderParams<T> {
	/**
	 * The field the value belongs to
	 */
	field: ModelFieldName;
	/**
	 * The value to render
	 */
	value: T;
	/**
	 * The initial value (server side value)
	 */
	initialValue: T;
	/**
	 * The label of the field
	 */
	label: string;
	/**
	 * The visibility to render the value at
	 */
	visibility: Visibility;
	/**
	 * The onChange handler for editable input fields
	 */
	handleChange: (field: ModelFieldName, value: T) => void;
	/**
	 * The onBlur handler for editable input fields
	 */
	handleBlur: React.FocusEventHandler<HTMLElement>;
	/**
	 * The error message or null if no error
	 */
	errorMsg: string | null;
	/**
	 * Function to set a new global form error
	 * @param error The error to display
	 */
	setError: (error: Error) => void;
	/**
	 * Sets the local validation error for a field
	 * @param field The field to set the validation error
	 * @param error The error
	 */
	setFieldError: (field: ModelFieldName, error: string) => void;
}

export default RenderParams;
