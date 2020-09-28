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
}

export default RenderParams;
