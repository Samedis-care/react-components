# ColorInput reports a blur once focus leaves the field and its picker, and a picker opened from the keyboard shows its focus

- **Date:** 2026-11-20
- **Kind:** behavior, type
- **Scope:** `standalone/UIKit` (ColorInput), and through it the model's color fields
  (`ModelDataTypeColorRendererCC`)

## What changed

- `onBlur` is called once focus leaves the field: from the input or one of the field's
  buttons ("Choose color", the info button) to anything outside them and the open picker.
  Opening the picker (a click into the field, or the "Choose color" button), picking a
  color in it and closing it again does not call it, nor does moving between the input
  and the buttons, so the picked color has been reported through `onChange` by then.
  Before, it was called as soon as the picker opened and took focus, before any color was
  picked, and on the way from the input to the "Choose color" button; focus leaving from
  one of the buttons was never reported.
- A press on the label, the helper text or the space around the input while focus is in
  the field keeps focus where it is; its click opens the picker, as before. Before, the
  press took focus to the page first, which reported a blur.
- `onBlur` receives the blur event of the field's input root (`.MuiInputBase-root`),
  which carries `name` as `data-name`: `currentTarget` is that element, `target` the input
  or the button that lost focus. Before, it was the blur event of the input. Its type is
  now `React.FocusEventHandler<HTMLElement>`. A blur handler set on the input root through
  `slotProps.input.slotProps.root.onBlur` still sees every blur of the root.
- The open picker draws a 2px outline in `palette.primary.main` around itself while it
  has focus, when the keyboard opened it (Enter or Space on the "Choose color" button).
  Opened by a click or a tap, it looks as before.

## Why

The open picker takes focus, so focus left the input on the way into the picker: Form
marked the field touched before a color was picked, and a consumer that saves on blur
saved the previous color. Keyboard users saw no focus on the open picker (WCAG 2.4.7
Focus Visible). The date pickers report a blur the same way since 2026-11-06.

## Migration

Nothing to do in the usual case: model forms pass Form's `handleBlur`, which finds the
field by the input root's `data-name`. Expect the outline around a picker opened from the
keyboard in screenshots.

Required for a consumer whose `onBlur` reads the value from the event
(`event.target.value`): the event's `target` can now be a button, whose `value` is `""`,
and TypeScript reports that `HTMLElement` has no `value`. Read the value you pass to
`value` instead:

```tsx
<ColorInput value={color} onChange={setColor} onBlur={() => save(color)} />
```
