# Models are typed by their fields

- **Date:** 2026-10-02
- **Kind:** type
- **Scope:** `backend-integration/Model` (`Model`, `ModelFieldDefinition`, the response types, the `useModel*` hooks)

## What changed

- `Model` has one type parameter, its field definitions: `Model<FieldsT>`. The constructor
  infers it, so `new Model(...)` returns a model whose `fields` keep each definition's type,
  including the `type` and its value type. `KeyT`, `VisibilityT` and `CustomT` are gone. (A
  second parameter holds the field names; it follows from `FieldsT` and is never written.)
- `ModelUnknown` (`Model` without arguments) is any model. Every model is assignable to it
  without a cast.
- New helpers, all taking a model type `M` (`typeof model`, `ReturnType<typeof SomeModel>`):
  - `ModelFieldNames<M>`: the field names.
  - `ModelFieldValues<M>`: the value of each field by field name (dot notation), as
    `setFieldValue` and `getFieldValue` see them.
  - `ModelRecord<M>`: a record as the model and the form build it. Fields in dot notation are
    nested objects (`parent.child` is `record.parent.child`), a field and its child fields
    (`result`, `result.found_at`) merge into one object. If the parent field may be `null`, so
    may the merged object.
  - `ModelRecordPartial<M>`: some fields of a record (what saving takes). Its `id` may be
    `null` or left out to create a record.
  - `ModelCustomData<M>`: the `customData` of the model's fields, a union over all fields.
  - `ModelWithCustomData<C>`: any model whose fields all carry custom data of type `C`.
  - `ModelFields` (any field map) replaces `ModelField<KeyT, VisibilityT, CustomT>`,
    `ModelFieldDefinitionUnknown` is the definition of any field.
- The field names are inferred from the field map's keys, also when a shared definition is
  typed with other keys. `onChange`'s `setFieldValue`/`getFieldValue` and
  `getRelationModelValues` only take this model's field names.
- A key a field definition doesn't know (e.g. `filterabel: true`) is a type error, as before.
- A field's `getDefaultValue` has to return its type's value, or `undefined` to fall back to the
  type's default. It wasn't checked before, so a field typed `string` could start as `null`.
- New: `ModelDataTypeStringNullable` and `ModelDataTypeStringNullableRendererCC`, a text field
  holding `string | null` (default `null`), for strings the server can leave unset.
- `validate`, `validateHint` and `onChange` of a field definition are methods. `onChange` gets
  the model as `ModelUnknown`, `getRelationModel` returns `ModelUnknown`.
- The responses are the model's records:
  - `ModelGetResponse<M>` is `[ModelRecord<M>, ModelGetResponseRelations<M>, unknown?]`.
  - `ModelIndexResponse<M>` is `[ModelRecord<M>[], ResponseMeta, unknown?]`.
  - `ModelData` is gone, use `ModelRecord`.
- `useModelGet`, `useModelFetchAll`, `useModelIndex`, `useModelIndex2` and `useModelMutation`
  are typed by the model they get. `useModelMutation` takes a `ModelRecordPartial<M>`.
- `getRaw`, `getCached`, `index`, `index2`, `fetchAll`, `fetchAllCached`,
  `createOrUpdateRecordRaw`, `updateStoredData` and `addEventHandler` of a model are typed by
  that model, `ModelEventMutation<M>` gets its records.
- `ModelHooks` and `ModelOptions` have no type parameter.

## Why

The field types were lost: every `fields[name].type` was `Type<any>`, so a record type derived
from a model held `any` for every field, and the data a model loaded was `Record<string,
unknown>`. A model now carries what its definitions say, and so do the records it loads.

## Migration

- Drop the type arguments: `Model<KeyT, VisibilityT, CustomT>` becomes `ModelUnknown` where
  any model goes, or `M extends ModelUnknown` where the code keeps a specific model's types.
  Casts to `Model<ModelFieldName, PageVisibility, unknown>` can go.
- A record type derived from a model by hand
  (`{ [K in keyof ReturnType<typeof X>["fields"]]: ReturnType<...["getDefaultValue"]> }`)
  becomes `ModelRecord<ReturnType<typeof X>>`. `Record<keyof ...["fields"], unknown>` becomes
  `ModelRecord<...>` or `Record<ModelFieldNames<...>, ...>`.
- Code reading records of a model gets their types now, which shows nullable values
  (`Date | null`, `number | null`) and enum values typed as `string` that were cast before.
- A `getDefaultValue` returning `null` for a non-nullable type is a type error. If the server
  never leaves the field empty, return the value it will set, or the type's empty value (`""`)
  when there is none yet. If it can, use a nullable type (`ModelDataTypeStringNullableRendererCC`,
  the nullable date renderers).
- Shared field definitions or `onChange` helpers typed with `string` field names have to take
  the model's field names (`ModelSetFieldValue<KeyT>` is the type of `onChange`'s
  `setFieldValue`).
- `customData` is typed per field. Code that iterates `model.fields` gets the union of the
  fields' custom data and needs no cast. A consumer that needs a shape takes
  `ModelWithCustomData<C>`. `as SomeCustomData` on a definition's `customData` does not check
  the data; a function taking `SomeCustomData` does.
- `ModelGetResponse<KeyT>` and `ModelIndexResponse` take the model:
  `ModelGetResponse<typeof model>`, `ModelGetResponse<ModelUnknown>` for any model.
