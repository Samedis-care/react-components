# CurrencyInput reports an emptied field once, on blur

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls` (`CurrencyInput`), and the renderer built on
  it (`ModelDataTypeDecimalCurrencyRendererCC`)

## What changed

Emptying a `CurrencyInput`, by deleting its text or with the touch Clear button, no longer
calls `onChange(null)` at once. The field reports `null` on the following blur, like any
other edit, and only there. Before, `onChange(null)` was called when the text became empty
and again on the blur.

## Why

Every emptied field was reported twice, which doubled the side effects of an `onChange`
that does more than keep the value: a recalculation, a request.

## Migration

Nothing to do for a CC Form, or for code that only keeps the value `onChange` reports.

Code that reacted to an emptied field while it still had focus now sees `null` on the
blur, like any other amount. A form submitted with Enter right after emptying the field
gets the amount from before the edit, as after any other edit.
