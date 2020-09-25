import React, { useContext } from "react";
import { FormContext } from "./Form";
import { useFormikContext } from "formik";

interface FieldProps {
	name: string;
}

const Field = (props: FieldProps): React.ReactElement => {
	const model = useContext(FormContext);
	if (!model) throw new Error("You can't use a Field without a Form");

	// eslint-disable-next-line @typescript-eslint/unbound-method
	const {
		values,
		errors,
		touched,
		handleChange,
		handleBlur,
	} = useFormikContext<Record<string, unknown>>();

	const fieldDef = model.model[props.name];

	return fieldDef.type.render({
		field: props.name,
		value: values[props.name],
		visibility:
			"id" in values && values["id"]
				? fieldDef.visibility.edit
				: fieldDef.visibility.create,
		handleChange,
		handleBlur,
		label: fieldDef.getLabel(),
		errorMsg: (touched[props.name] && errors[props.name]) || null,
	});
};

export default React.memo(Field);
