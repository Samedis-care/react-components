# DateInput passes the slots a consumer gives it on to the picker

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls`, `backend-integration/Model/Types/Renderers`

## What changed

`DateInput` hands its `slots` prop to MUI's picker, as `DateTimeInput` already did. A slot
an app passes now takes effect: `openPickerIcon` renders that icon instead of MUI's
calendar, and `day`, `actionBar`, `layout`, `toolbar` and the rest are the app's, not MUI's.
Before, `DateInput` built its own `slots` object with only the text field in it, so every
slot the app passed was dropped without a word, although the prop is typed and documented
as MUI's.

The model date renderers (`ModelDataTypeDateRendererCC` and
`ModelDataTypeDateNullableRendererCC`) pass their constructor props on to `DateInput`, so a
`slots` given to one of them now takes effect in the same way.

`DateInput`'s own slots come first, so `slots.textField` replaces the components-care text
field (`PickersTextFieldWithHelp`) with the text field the app passed. Compared with the
components-care field, the app's field loses the Clear button on touch devices, the label
that is always raised above the field (the components-care field sets `shrink: true`; MUI's
own leaves an empty field's label inside it) and the components-care input styling
(`CcUiKitPickersTextField`: the input's padding and, with `important`, the red placeholder).
The `warning` and `dirty` states and the helper text's link to the field group do not depend
on the text field and stay either way.

`DateInput` without a `slots` prop renders as before.

## Why

A typed prop that is silently ignored is a bug: the app's custom calendar icon (or action
bar, layout) never showed and nothing said why. MUI's picker takes these slots, and
`DateTimeInput` has always passed them through.

## Migration

Nothing to do for an app that passes no `slots` to `DateInput` or to a model date renderer.
An app that passed them and worked around their being ignored can drop the workaround: its
slots now render. Required for apps that pass `slots.textField` to `DateInput` (also through
`ModelDataTypeDateRendererCC` or `ModelDataTypeDateNullableRendererCC`) and want to keep the
components-care text field (Clear button on touch devices, label always above the field):
remove `slots.textField`.

```tsx
// before
<DateInput value={day} onChange={setDay} slots={{ textField: MyTextField }} />
// after: the components-care text field, with the Clear button and the raised label
<DateInput value={day} onChange={setDay} />
```
