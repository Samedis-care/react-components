import React, { useCallback, useEffect, useMemo } from "react";
import { useFormContext } from "./Form";
import {
	ModelFieldDefinition,
	PageVisibility,
} from "../../backend-integration";
import { getVisibility } from "../../backend-integration/Model/Visibility";

type NonOverridableProps =
	| "getDefaultValue"
	| "validate"
	| "filterable"
	| "sortable"
	| "columnWidth";

interface FieldProps {
	/**
	 * The name of the field as specified in the model
	 */
	name: string;
	/**
	 * Overrides for the model information
	 */
	overrides?:
		| Partial<
				Omit<
					ModelFieldDefinition<unknown, string, PageVisibility, never>,
					NonOverridableProps
				>
		  >
		| ((
				original: ModelFieldDefinition<unknown, string, PageVisibility, never>
		  ) => Omit<
				ModelFieldDefinition<unknown, string, PageVisibility, never>,
				NonOverridableProps
		  >);
}

const Field = (props: FieldProps): React.ReactElement => {
	const {
		values,
		errors,
		touched,
		setFieldValue,
		handleBlur,
		initialValues,
		setFieldTouched,
		setError,
		model,
		markFieldMounted,
		relations,
	} = useFormContext();

	let fieldDef: ModelFieldDefinition<unknown, string, PageVisibility, never> =
		model.fields[props.name];

	if (!fieldDef) throw new Error("Invalid field name specified: " + props.name);
	if (props.overrides) {
		if (typeof props.overrides === "function") {
			fieldDef = props.overrides(fieldDef);
		} else if (typeof props.overrides === "object") {
			Object.assign(fieldDef, props.overrides);
		}
	}

	const { onChange, type, getRelationModel } = fieldDef;

	const setFieldValueHookWrapper = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(field: string, value: any, shouldValidate?: boolean) => {
			if (onChange) {
				value = onChange(value, model, setFieldValue);
			}
			setFieldValue(field, value, shouldValidate);
		},
		[setFieldValue, onChange, model]
	);

	const relationModel = useMemo(
		() => (getRelationModel ? getRelationModel() : undefined),
		[getRelationModel]
	);

	// mark field as mounted
	useEffect(() => {
		markFieldMounted(props.name, true);
		return () => markFieldMounted(props.name, false);
	}, [markFieldMounted, props.name]);

	const { name } = props;
	const value = values[name];
	const initialValue = initialValues[name];
	const hasId = "id" in values && values["id"];
	const label = fieldDef.getLabel();
	const touch = touched[props.name] || false;
	const errorMsg = (touch && errors[props.name]) || null;
	const relationData = relations[props.name];
	const visibility = getVisibility(
		hasId ? fieldDef.visibility.edit : fieldDef.visibility.create,
		values
	);

	return useMemo(
		() =>
			type.render({
				field: name,
				value: value,
				touched: touch,
				initialValue: initialValue,
				visibility: visibility,
				handleChange: setFieldValueHookWrapper,
				handleBlur,
				label: label,
				errorMsg: errorMsg,
				setError,
				setFieldTouched,
				relationModel,
				relationData,
			}),
		[
			value,
			name,
			type,
			label,
			visibility,
			setFieldValueHookWrapper,
			handleBlur,
			errorMsg,
			setError,
			setFieldTouched,
			initialValue,
			touch,
			relationModel,
			relationData,
		]
	);
};

export default React.memo(Field);
