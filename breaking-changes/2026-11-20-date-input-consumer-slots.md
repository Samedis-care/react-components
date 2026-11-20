# DateInput passes the slots a consumer gives it on to the picker

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls`

## What changed

`DateInput` hands its `slots` prop to MUI's picker, as `DateTimeInput` already did. A slot
an app passes now takes effect: `openPickerIcon` renders that icon instead of MUI's
calendar, and `day`, `actionBar`, `layout`, `toolbar` and the rest are the app's, not MUI's.
Before, `DateInput` built its own `slots` object with only the text field in it, so every
slot the app passed was dropped without a word, although the prop is typed and documented
as MUI's.

The app's slots come after `DateInput`'s own, so `slots.textField` replaces
`PickersTextFieldWithHelp` too. That text field carries the touch Clear button, the
`warning` and `dirty` states and the link from a helper text to the field group; an app that
swaps it in gets MUI's `PickersTextField` and loses those.

`DateInput` without a `slots` prop renders as before.

## Why

A typed prop that is silently ignored is a bug: the app's custom calendar icon (or action
bar, layout) never showed and nothing said why. MUI's picker takes these slots, and
`DateTimeInput` has always passed them through.

## Migration

Nothing to do for an app that passes no `slots` to `DateInput`. An app that passed them and
worked around their being ignored can drop the workaround: its slots now render. An app
that passed `slots.textField` gets it now, in place of the components-care text field; drop
that slot to keep the Clear button, `warning`/`dirty` and the linked helper text.
