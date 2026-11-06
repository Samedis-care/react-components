# CurrencyInput says in text why the amount is invalid

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls/CurrencyInput`

## What changed

When the text of a `CurrencyInput` does not parse on blur (a separator without a
digit, such as `"."`), the field now shows a message under it, "Enter a number, such
as €1,234.56", with the example in the field's own currency and language format. The
message takes the place of `helperText` while it shows and is the input's accessible
description (`aria-describedby`). As before, the field is marked invalid and
`onChange` is not called, so the previous amount stays.

The message, and the invalid state, now go away when the text is replaced from
outside: a new `value`, a new `currency` or a language switch. Before, the field
showed the new amount but stayed invalid until the next blur. A valid edit still
clears it on blur.

The message is the new translation key `standalone.uikit.number-input.invalid`
(`{{EXAMPLE}}` is the formatted example), in every locale.

## Why

The field only turned red: there was no text saying what was wrong, nothing for a
screen reader beyond "invalid entry", and nothing at all in forced-colors mode, where
the red is gone. And an error that outlived a reset or reload marked a valid amount
as invalid.

## Migration

Nothing to do. Expect the message under a `CurrencyInput` whose text is invalid, in
place of its `helperText`. A model field (`ModelDataTypeDecimalCurrencyRendererCC`)
shows it above the form's own message.
