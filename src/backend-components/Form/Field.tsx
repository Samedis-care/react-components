import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { useFormContext } from "./Form";
import {
	ModelFieldDefinition,
	ModelRenderParams,
	PageVisibility,
} from "../../backend-integration";
import { getVisibility } from "../../backend-integration/Model/Visibility";
import { dotsToObject, getValueByDot } from "../../utils/dotUtils";
import Type from "../../backend-integration/Model/Type";
import shallowCompare from "../../utils/shallowCompare";
import RenderParams from "../../backend-integration/Model/RenderParams";

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
				original: ModelFieldDefinition<unknown, string, PageVisibility, never>,
		  ) => Omit<
				ModelFieldDefinition<unknown, string, PageVisibility, never>,
				NonOverridableProps
		  >);
}

export interface FormFieldContextType<T> extends ModelRenderParams<T> {
	type: Type<T>;
}

export const FormFieldContext =
	React.createContext<FormFieldContextType<unknown> | null>(null);
export const useFormFieldContext = <T,>(): FormFieldContextType<T> => {
	const ctx = useContext(FormFieldContext);
	if (!ctx) throw new Error("FormFieldContext not set");
	return ctx as FormFieldContextType<T>;
};

const Field = (props: FieldProps): React.ReactElement => {
	const {
		values,
		errors,
		warnings,
		touched,
		setFieldValue,
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

	const { type, getRelationModel, getRelationModelValues } = fieldDef;

	const setFieldValueHookWrapper = useCallback(
		(
			field: string,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			value: any,
			shouldValidate?: boolean,
			triggerOnChange?: boolean,
		) => {
			setFieldValue(field, value, shouldValidate, triggerOnChange ?? true);
		},
		[setFieldValue],
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
		values,
		initialValues,
	);

	// cache these, so we don't trigger useless re-renders every time a value changes
	const prevRelationModelValues = useRef<Record<string, unknown>>({});
	const prevRelationModelValuesResult = useRef<Record<string, unknown>>({});
	const relationModelValues = useMemo(() => {
		const pick = getRelationModelValues ?? [];
		const result: Record<string, unknown> = {};
		pick.forEach((field) => (result[field] = getValueByDot(field, values)));

		if (shallowCompare(prevRelationModelValues.current, result)) {
			return prevRelationModelValuesResult.current;
		}

		prevRelationModelValues.current = result;
		return (prevRelationModelValuesResult.current = dotsToObject(result));
	}, [values, getRelationModelValues]);

	const relationModel = useMemo(
		() =>
			getRelationModel
				? getRelationModel(hasId || null, relationModelValues)
				: undefined,
		[getRelationModel, hasId, relationModelValues],
	);

	const cacheKey = useMemo(
		() => new Object(),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		(fieldDef.type.settings?.updateHooks ?? []).map((key) =>
			getValueByDot(key, values),
		),
	);

	return useMemo(
		() => {
			const renderParams: RenderParams<unknown> = {
				field: name,
				value: value,
				touched: touch,
				initialValue: initialValue,
				visibility: readOnly ? { ...visibility, readOnly: true } : visibility,
				handleChange: setFieldValueHookWrapper,
				setFieldValue: setFieldValueHookWrapper,
				handleBlur,
				label: label,
				errorMsg,
				warningMsg,
				setError,
				setFieldTouched,
				relationModel,
				relationData,
				values,
			};
			return (
				<FormFieldContext.Provider value={{ ...renderParams, type }}>
					{type.render(renderParams)}
				</FormFieldContext.Provider>
			);
		},
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
		],
	);
};

export default React.memo(Field);
