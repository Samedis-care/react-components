# Date and date-time fields show their message as the field's helper text

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls` (`DateInput`, `DateTimeInput`),
  `backend-integration/Model` (the date and date-time renderers)

## What changed

- `DateInput` and `DateTimeInput` take a `helperText` prop. It is shown below the field and
  is the description of the field group (`aria-describedby`), so a screen reader reads it
  when the user reaches the field. It takes the place of `slotProps.textField.helperText`,
  which is still used while `helperText` is undefined.
- The date and date-time renderers (`ModelDataTypeDateRendererCC`,
  `ModelDataTypeDateNullableRendererCC`, `ModelDataTypeDateTimeRendererCC`,
  `ModelDataTypeDateTimeNullableRendererCC`, `ModelDataTypeDateRendererMUI` and
  `ModelDataTypeDateNullableRendererMUI`) pass the field's error or warning message as that
  helper text. They no longer render it as a separate element after the field.
  - The message sits inside the field's form control and is indented to the field's text,
    as a MUI text field's helper text is: 14 px further right than the message under a
    text field renderer. Its color is unchanged (red for an error, the warning color for a
    warning).
  - Without a message nothing is rendered below the field. The empty element that used to
    be there, with its 3 px top margin, is gone.
  - `render()` of these renderers returns the input element itself, not a fragment holding
    the input and the message.

## Why

A screen reader user who reached an invalid date field heard that it was invalid, but not
why: the message was a sibling of the field with no link to it.

## Migration

- Pages that use the model renderers: nothing to do. Screenshots of forms with a date field
  that shows a message show it at its new position.
- Code that renders its own message next to a `DateInput` or `DateTimeInput`: pass the
  message as `helperText` and drop the separate element. Until then the message stays
  unlinked from the field. A hint passed as `slotProps.textField.helperText` keeps working.

  ```tsx
  <DateInput {...props} error={!!error} helperText={errorMessage} />
  ```

- Tests that read the input out of a date renderer's element (`element.props.children[0]`):
  the returned element is the input now.
