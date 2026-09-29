# FormField can start the form in a field

- **Date:** 2026-09-29
- **Kind:** type, behavior
- **Scope:** `backend-components/Form` (`FormField`), `backend-integration/Model` (`RenderParams`,
  the renderers and their options), `standalone/Selector` (`BaseSelector`, `MultiSelectWithTags`),
  `standalone/UIKit` (`MultiLanguageInput`)

## What changed

- `FormField` takes `autoFocus`. The field's control takes the focus when it mounts:

  ```tsx
  <FormField name={"serial_number"} autoFocus />
  ```

  It applies while the field mounts only. Turning it on for a field that is already shown
  does not move the focus, and a control that replaces its input later, such as a selector
  refreshing its options, does not take the focus back.

- `RenderParams` has a **required** `autoFocus: boolean`, true while the field mounts if the
  form should start in it, false otherwise. Every renderer in the library with a keyboard
  input hands it to its control: text and number fields, dates, selectors, checkboxes,
  switches and enum selects. A radio group focuses the checked option, or the first one when
  none is checked; an enum rendered as checkboxes focuses its first one; a string array the
  empty entry at its end, where a new value goes. File and image uploads, the signature pad and the data grid multi select
  ignore it. Data grid cells and the CRUD import preview pass `false`.
- The renderer options no longer take `autoFocus`. Until now it reached the control through
  the spread options (`new ModelDataTypeStringRendererMUI({ autoFocus: true })`); the renderer
  sets it from `RenderParams` now, after the options. Affected: the string, integer, decimal,
  currency, color, date, localized string and string array renderers (UIKit and MUI), the
  boolean switch's `switchProps`, and the selector renderers.
- `BaseSelector` has an `autoFocus` prop, which focuses its search input on mount. It reaches
  `SingleSelect`, `MultiSelect`, `BackendSingleSelect` and `BackendMultiSelect` through their
  props. `MultiSelectWithTags` (and `BackendMultiSelectWithTags`) take it too and give it to the
  group selector.
- `MultiLanguageInput` gives `autoFocus` to its first field only, the default language (or
  the active one when multiline). It used to pass it to every language field, so expanding
  the languages moved the focus to the last one.

## Why

A form that opens on a record to check, or on the one field that needs attention, should
put the cursor there. The only way to do that was to look the input up in the DOM after
mounting, which depends on the markup of each control and misses controls whose input is
not an `<input>` (the date pickers edit sections, not an input).

## Migration

- Replace DOM lookups that focus a field's input with `<FormField name={...} autoFocus />`.
- Code that builds `RenderParams` itself, i.e. calls `type.render({ ... })` without spreading
  params it was given, has to pass `autoFocus: false`.
- Custom renderers: destructure `autoFocus` and hand it to the control's `autoFocus`, after any
  spread options. Until they do, `FormField autoFocus` does nothing for fields they render.
  Renderers that delegate by spreading `params` into another renderer need no change.
- A renderer constructed with `autoFocus` in its options no longer compiles: drop the option
  and set `autoFocus` on the `FormField` instead.
