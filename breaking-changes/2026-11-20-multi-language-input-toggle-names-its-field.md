# MultiLanguageInput's translate button is named after its field and says whether the other languages are shown

- **Date:** 2026-11-20
- **Kind:** behavior, i18n
- **Scope:** `standalone/UIKit/InputControls`

## What changed

The single-line translate button now has a name that includes the field's `label`
("Show translations of Title", from the new i18n key
`standalone.uikit.multi-language-input.show-translations-of`) instead of the generic
"Toggle language inputs", and the same text as its tooltip. It reports the state of the
fields it shows with `aria-expanded`, and points at them with `aria-controls`. Without a
`label` the button keeps the generic name and gets the same tooltip and ARIA state.

## Why

A form with a localized title and description had two buttons that a screen reader's
button list could not tell apart, and nothing said whether the other languages were shown
(WCAG 4.1.2, 2.4.6). Sighted users got an unexplained icon.

## Migration

A consumer that looked the button up by its old name (`"Toggle language inputs"`, e.g. in
its own tests) has to use the new name or the generic one without a label. Nothing else to
do; the button also shows a tooltip on hover and focus now.
