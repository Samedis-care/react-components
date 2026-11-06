import React, {
	useCallback,
	useContext,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { useFormContext } from "./Form";
import {
	ModelFieldDefinitionUnknown,
	ModelRenderParams,
	ModelUnknown,
} from "../../backend-integration";
import { getVisibility } from "../../backend-integration/Model/Visibility";
import { dotsToObject, getValueByDot } from "../../utils/dotUtils";
import Type from "../../backend-integration/Model/Type";
import shallowCompare from "../../utils/shallowCompare";
import RenderParams from "../../backend-integration/Model/RenderParams";
import { useDirtyState } from "./DirtyStateContext";

type NonOverridableProps =
	"getDefaultValue" | "validate" | "filterable" | "sortable" | "columnWidth";

interface FieldProps {
	/**
	 * The name of the field as specified in the model
	 */
	name: string;
	/**
	 * Overrides for the model information
	 */
	overrides?:
		| Partial<Omit<ModelFieldDefinitionUnknown, NonOverridableProps>>
		| ((
				original: ModelFieldDefinitionUnknown,
		  ) => Omit<ModelFieldDefinitionUnknown, NonOverridableProps>);
	/**
	 * Focus the field's control when it mounts, e.g. the field a form should start in
	 * @remarks Like the `autoFocus` attribute: it applies when the control mounts, so
	 *          turning it on for a control that is already shown does not move the
	 *          focus. Only editable controls with a keyboard input take it; file and
	 *          image uploads, the signature pad and the data grid multi select ignore it.
	 */
	autoFocus?: boolean;
	/**
	 * The id of the field's control, unique in the document
	 * @remarks Default: an id generated for this FormField. The renderer gives it to the
	 *          control the user operates (the input, the combobox of a selector, the group
	 *          of a radio field or of a list of checkboxes), and the field's error or
	 *          warning message gets the id `<id>-message`. Date and time fields, localized
	 *          strings, file and image uploads, the signature pad, the tag selector and the
	 *          data grid multi select do not use it yet.
	 */
	id?: string;
	/**
	 * The ids of elements that describe the field, separated by spaces, such as
	 * instructions the page shows next to it
	 * @remarks The control references them, followed by the field's error or warning
	 *          message while one is shown. Default: none, so only the message describes the
	 *          control. The selectors, and the controls `id` lists as not using it, do not
	 *          take a description yet.
	 */
	"aria-describedby"?: string;
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

export const useFieldRelationModel = (
	fieldDef: ModelFieldDefinitionUnknown,
) => {
	const { values } = useFormContext<ModelUnknown>();
	const { getRelationModel, getRelationModelValues } = fieldDef;
	const hasId = "id" in values && (values["id"] as string | null);
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

	return useMemo(
		() =>
			getRelationModel
				? getRelationModel(hasId || null, relationModelValues)
				: undefined,
		[getRelationModel, hasId, relationModelValues],
	);
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
	} = useFormContext<ModelUnknown>();

	let fieldDef: ModelFieldDefinitionUnknown = model.fields[props.name];

	if (!fieldDef) throw new Error("Invalid field name specified: " + props.name);
	if (props.overrides) {
		if (typeof props.overrides === "function") {
			fieldDef = props.overrides(fieldDef);
		} else if (typeof props.overrides === "object") {
			fieldDef = Object.assign({}, fieldDef, props.overrides);
		}
	}

	const { type } = fieldDef;

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

	// only while the field mounts: a control that remounts its input later (a
	// selector refreshing its options) must not pull the focus back to itself
	const [autoFocus, setAutoFocus] = useState(!!props.autoFocus);
	useEffect(() => setAutoFocus(false), []);

	const generatedId = useId();
	const id = props.id ?? generatedId;
	const messageId = id + "-message";

	const { name } = props;
	const value = getValueByDot(name, values);
	const initialValue = initialValues[name];
	const hasId = "id" in values && (values["id"] as string | null);
	const label = fieldDef.getLabel();
	const touch = touched[props.name] || false;
	const errorMsg = (touch && errors[props.name]) || null;
	const warningMsg = (touch && warnings[props.name]) || null;
	// the app's description first, then what is wrong with the value
	const describedBy =
		[props["aria-describedby"], (errorMsg || warningMsg) && messageId]
			.filter(Boolean)
			.join(" ") || undefined;
	const relationData = relations[props.name];
	const dirty = useDirtyState(props.name);
	const visibility = getVisibility(
		hasId ? fieldDef.visibility.edit : fieldDef.visibility.create,
		values,
		initialValues,
	);

	const relationModel = useFieldRelationModel(fieldDef);

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
				id,
				messageId,
				describedBy,
				value: value,
				touched: touch,
				dirty: dirty,
				autoFocus: autoFocus,
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
			id,
			describedBy,
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
			dirty,
			autoFocus,
			relationModel,
			relationData,
			readOnly,
			cacheKey, // check for important values changes
		],
	);
};

export default React.memo(Field);
