import React, { useCallback, useEffect, useMemo } from "react";
import { useFormContext } from "./Form";
import {
	ModelFieldDefinition,
	PageVisibility,
} from "../../backend-integration";
import { getVisibility } from "../../backend-integration/Model/Visibility";
import { getValueByDot } from "../../utils";

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
		warnings,
		touched,
		setFieldValue,
		getFieldValue,
		handleBlur,
		initialValues,
		setFieldTouched,
		setError,
		model,
		markFieldMounted,
		relations,
		readOnly,
	} = useFormContext();

	let fieldDef: ModelFieldDefinition<unknown, string, PageVisibility, never> =
		model.fields[props.name];

	if (!fieldDef) throw new Error("Invalid field name specified: " + props.name);
	if (props.overrides) {
		if (typeof props.overrides === "function") {
			fieldDef = props.overrides(fieldDef);
		} else if (typeof props.overrides === "object") {
			fieldDef = Object.assign({}, fieldDef, props.overrides);
		}
	}

	const { onChange, type, getRelationModel } = fieldDef;

	const setFieldValueHookWrapper = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(field: string, value: any, shouldValidate?: boolean) => {
			if (onChange) {
				value = onChange(value, model, setFieldValue, getFieldValue);
			}
			setFieldValue(field, value, shouldValidate);
		},
		[setFieldValue, getFieldValue, onChange, model]
	);

	// mark field as mounted
	useEffect(() => {
		markFieldMounted(props.name, true);
		return () => markFieldMounted(props.name, false);
	}, [markFieldMounted, props.name]);

	const { name } = props;
	const value = getValueByDot(name, values);
	const initialValue = initialValues[name];
	const hasId = "id" in values && (values["id"] as string | null);
	const label = fieldDef.getLabel();
	const touch = touched[props.name] || false;
	const errorMsg = (touch && errors[props.name]) || null;
	const warningMsg = (touch && warnings[props.name]) || null;
	const relationData = relations[props.name];
	const visibility = getVisibility(
		hasId ? fieldDef.visibility.edit : fieldDef.visibility.create,
		values
	);

	const relationModel = useMemo(
		() => (getRelationModel ? getRelationModel(hasId || null) : undefined),
		[getRelationModel, hasId]
	);

	const cacheKey = useMemo(
		() => new Object(),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		(fieldDef.type.settings?.updateHooks ?? []).map((key) =>
			getValueByDot(key, values)
		)
	);

	return useMemo(
		() =>
			type.render({
				field: name,
				value: value,
				touched: touch,
				initialValue: initialValue,
				visibility: readOnly ? { ...visibility, readOnly: true } : visibility,
				handleChange: setFieldValueHookWrapper,
				handleBlur,
				label: label,
				errorMsg,
				warningMsg,
				setError,
				setFieldTouched,
				relationModel,
				relationData,
				values,
			}),
		// do not update every time values change
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			value,
			name,
			type,
			label,
			visibility,
			setFieldValueHookWrapper,
			handleBlur,
			errorMsg,
			warningMsg,
			setError,
			setFieldTouched,
			initialValue,
			touch,
			relationModel,
			relationData,
			readOnly,
			cacheKey, // check for important values changes
		]
	);
};

export default React.memo(Field);
