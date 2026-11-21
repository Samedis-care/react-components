# The text and date fields no longer take `important`

- **Date:** 2026-11-21
- **Kind:** type
- **Scope:** `standalone/UIKit`

## What changed

`important` is no longer part of `UIInputProps`, and so no longer a prop of the fields whose
props include them: `TextFieldWithHelp`, `DateInput`, `DateTimeInput`, `IntegerInputField`,
`DecimalInputField`, `CurrencyInput`, `ColorInput`, the selectors built on `BaseSelector`,
and the UiKit inputs (`UiKitInput`, `UiKitInputOutlined`, `UiKitTextField`,
`UiKitPickersTextField`). TypeScript rejects it.

Its only effect was a placeholder in `palette.error.main` at the 0.42 opacity MUI gives
every placeholder, and only on a standard (`variant="standard"`) text field. That style is
gone, so a field's placeholder always looks like the placeholder of MUI's own field.

## Why

The pale red placeholder was the only sign that a field was important: a contrast of
1.96:1 against white, invisible to anyone who cannot tell the color apart, never announced
by a screen reader, and gone as soon as the user started typing. MUI marks a field that
must be filled with `required`, which shows an asterisk after the label and puts the
required state on the input, where assistive technology reports it.

## Migration

Nothing to do for samedis.care and identity-management, which never pass `important`.

Required for any app that passes `important`: remove it, or replace it with `required`
where the field must be filled. Without this the TypeScript build fails; an untyped caller
that keeps passing it gets no red placeholder anymore.

```tsx
// before
<TextFieldWithHelp label={t("name")} important />
// after
<TextFieldWithHelp label={t("name")} required />
```
