import React, { useCallback, useContext, useMemo } from "react";
import { FormContext } from "./Form";
import { useFormikContext } from "formik";
import {
	ModelFieldDefinition,
	PageVisibility,
} from "../../backend-integration/Model";

interface FieldProps {
	/**
	 * The name of the field as specified in the model
	 */
	name: string;
}

const Field = (props: FieldProps): React.ReactElement => {
	const formContext = useContext(FormContext);
	if (!formContext) throw new Error("You can't use a Field without a Form");

	// eslint-disable-next-line @typescript-eslint/unbound-method
	const {
		values,
		errors,
		touched,
		setFieldValue,
		handleBlur,
	} = useFormikContext<Record<string, unknown>>();

	const { setError, model } = formContext;

	const fieldDef: ModelFieldDefinition<
		unknown,
		string,
		PageVisibility,
		unknown | null
	> = model.fields[props.name];

	const setFieldValueHookWrapper = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(field: string, value: any, shouldValidate?: boolean) => {
			if (fieldDef.onChange) {
				value = fieldDef.onChange(value, model, setFieldValue);
			}
			setFieldValue(field, value, shouldValidate);
		},
		[setFieldValue, fieldDef, model]
	);

	if (!fieldDef) throw new Error("Invalid field name specified: " + props.name);

	const { name } = props;
	const value = values[name];
	const hasId = "id" in values && values["id"];
	const label = fieldDef.getLabel();
	const errorMsg = (touched[props.name] && errors[props.name]) || null;

	return useMemo(
		() =>
			fieldDef.type.render({
				field: name,
				value: value,
				visibility: hasId
					? fieldDef.visibility.edit
					: fieldDef.visibility.create,
				handleChange: setFieldValueHookWrapper,
				handleBlur,
				label: label,
				errorMsg: errorMsg,
				setError,
			}),
		[
			value,
			name,
			hasId,
			fieldDef,
			label,
			setFieldValue,
			handleBlur,
			errorMsg,
			setError,
		]
	);
};

export default React.memo(Field);
