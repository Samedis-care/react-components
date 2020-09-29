import React, { useContext, useMemo } from "react";
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
		setFieldValue,
		handleBlur,
	} = useFormikContext<Record<string, unknown>>();

	const fieldDef = model.model[props.name];

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
				handleChange: setFieldValue,
				handleBlur,
				label: label,
				errorMsg: errorMsg,
			}),
		[value, name, hasId, fieldDef, label, setFieldValue, handleBlur, errorMsg]
	);
};

export default React.memo(Field);
