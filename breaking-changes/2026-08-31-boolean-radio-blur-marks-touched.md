# Checkboxes, switches and radio groups mark their field touched on blur

- **Date:** 2026-08-31
- **Kind:** behavior
- **Scope:** `backend-integration/Model/Types/Renderers/Material-UI`

## What changed

`RendererBooleanCheckbox`, `RendererBooleanSwitch` and `RendererEnumRadio` (the
Material-UI ones) now carry `data-name` on the element their `onBlur` actually fires on,
so blurring them marks the field touched the way every other control does.

## Why

`Form.handleBlur` resolves the field from `name`, `data-name` or `id` on the blur target.
MUI puts `onBlur` on `SwitchBase`'s root `<span>`, and `name` on the `<input>` inside it;
`RadioGroup` puts `onBlur` on a plain `<div>` and `name` on the radios. So the handler
found nothing on all three, logged

```
[Components-Care] [Form] Handling on blur event for element without name.
Please set form name via one of these attributes: name, data-name or id
```

and returned without marking anything. The UIKit checkbox renderer and the multi-checkbox
enum renderer already set `data-name` for exactly this reason — these three were the gaps.

## Migration

Nothing to change, but the consequences of a field becoming touched now apply to these
three renderers:

- **Validation errors and warnings become visible on blur** rather than only after a
  submit attempt. `Field` gates `errorMsg`/`warningMsg` on `touched`, so a required
  checkbox that the user focused and left empty now shows its error immediately.
- The console error above stops appearing.
