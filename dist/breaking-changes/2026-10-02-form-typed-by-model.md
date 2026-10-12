# The form is typed by its model

- **Date:** 2026-10-02
- **Kind:** type
- **Scope:** `backend-components/Form` (`Form`, `FormContextData`, `useFormContext`, `useFormContextLite`, `PageProps`, `PreSubmitParams`, `FlowEngine`)

## What changed

- `FormProps<M, CustomPropsT>`, `PageProps<M, CustomPropsT>` and `PreSubmitParams<M>` take the
  form's model instead of `KeyT, VisibilityT, CustomT`. `Form` infers `M` from `model`.
- `FormContextData<M, CustomPropsT>` and `FormContextDataLite<M, CustomPropsT>` are typed by
  the model:
  - `values`, `initialValues` and `getFieldValues()` are `ModelRecord<M>`.
  - `setFieldValue` and `setFieldValueLite` take a field name of the model and that field's
    value type, `getFieldValue` returns it.
  - `setFieldTouched`/`setFieldTouchedLite` take a field name, `dirtyFields` has one entry per
    field, `relations` is keyed by field name, `customProps` is `CustomPropsT`.
- `useFormContext` and `useFormContextLite` require the model type:
  `useFormContext<typeof model>()` or `useFormContext<SomeModelType, CustomProps>()`. A call
  without a type argument does not compile. `useFormContext<ModelUnknown>()` is the
  context of any form, for code that works with every form.
- `FormContextData` and `FormContextDataLite` have no default for `M` either:
  `FormContextData["getFieldValue"]` becomes `FormContextData<M>["getFieldValue"]`.
- `PageProps.values`, the records `onSubmit` and `onSubmitUserInteractive` get and
  `PreSubmitParams`' `serverData`/`formData` are `ModelRecord<M>`, `initialRecord` is a
  `ModelRecordPartial<M>`.
- `alwaysSubmitFields` and `alwaysWarnFields` take field names of the model.
- `nestedFormPreSubmitHandler` gets the model and this form's typed `getFieldValue` and
  `setFieldValueLite`.
- `FlowEngine`, `FlowFormProps` and `FlowStageProps` take the model instead of `KeyT`.
- `BasicFormPage`, `DefaultFormPage`, `EditOnlyFormPage` and `FlowEngineFormPage` take the
  page props of any model.

## Why

The form context had no types: values were `Record<string, unknown>`, field values `unknown`,
and every read was a cast. With models typed by their fields (see
[Models are typed by their fields](2026-10-02-models-typed-by-their-fields.md)), the form
knows its records. The context reaches a component through React context, which carries no
type, so the component names the model, and requiring it keeps an untyped call from passing
unnoticed. The type argument is not checked against the model the form uses.

## Migration

- Name the model in every `useFormContext()`/`useFormContextLite()` call. An app can export
  one typed hook per model (`() => useFormContext<InventoryModelType>()`). Code that works
  with any form takes `ModelUnknown`.
- Page components declared as `PageProps<ModelFieldName, CustomProps>` take the model:
  `PageProps<SomeModelType, CustomProps>`, or `PageProps<ModelUnknown, CustomProps>` for a
  page that works with any form.
- Drop the casts on `values.x`, `getFieldValue(...)` and the records passed to `onSubmit`.
  What then fails to compile was a mismatch the casts hid (nullable values, a field name that
  isn't in the model, a value of the wrong type).
- `setFieldValue` and `getFieldValue` only take the model's fields. A value that is not a
  field of the model has to become one.
