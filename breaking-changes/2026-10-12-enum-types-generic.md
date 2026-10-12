# Enum types are typed by their values

- **Date:** 2026-10-12
- **Kind:** type, behavior
- **Scope:** `backend-integration/Model/Types` (`TypeEnum`, `TypeMultiEnum`, `EnumValue`, `AdvancedEnumValue`, `AdvancedMultiEnumValue`, the enum renderers)

## What changed

- `EnumValue<T>`, `AdvancedEnumValue<T>` and `AdvancedMultiEnumValue<T>` take the type of their
  `value`, `string` by default.
- `TypeEnum<T>` holds `T`, `TypeMultiEnum<T>` holds `T[]`. Both default to `string`. Nothing adds
  `""`: an enum that can be empty declares it, `ModelDataTypeEnumSelectRenderer<X | "">`.
- The single-value enum renderers (`ModelDataTypeEnumSelectRenderer`, the Material-UI radio and
  simple select) take the default value as their second argument: one of the values, or `""` for
  an enum that declares it. It replaces the implicit `""` a new record started with.
- `null` from the server deserializes to the default value (`""` for an enum that starts empty).
- `ModelDataTypeEnumSelectRenderer` can only be cleared when its default is `""`; clearing sets
  the default.
- The enum renderers (`ModelDataTypeEnumSelectRenderer`, `ModelDataTypeEnumMultiSelectRenderer`,
  the Material-UI radio, simple select and multi checkbox) infer `T` from the values they get.

## Why

An enum field's value is one of its values, so a record of a model can carry that union rather
than `string`. An empty value is one of them only where the field says so.

## Migration

- Nothing to do where the values are plain strings: those fields stay `string`.
- Pass the default value: `new ModelDataTypeEnumSelectRenderer(values, "active", props)`. A
  field that starts empty passes `""`, which has to be one of its values: plain `string` values
  allow it, a typed union declares it, `new ModelDataTypeEnumSelectRenderer<X | "">(values, "")`.
- A field-level `getDefaultValue` still wins over the renderer's default.
- To type a field by its values, build them from a constant typed as the union, e.g.
  `(["a", "b"] as const).map((value) => ({ value, getLabel: … }))`. The record then holds
  `"a" | "b"`.
- A subclass of an enum renderer passes `T` on: `class X<T extends string = string> extends
  ModelDataTypeEnumSelectRenderer<T>`.
