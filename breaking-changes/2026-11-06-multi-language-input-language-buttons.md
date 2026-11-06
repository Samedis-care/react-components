# A multiline MultiLanguageInput switches its language with buttons below the field

- **Date:** 2026-11-06
- **Kind:** behavior, theme
- **Scope:** `standalone/UIKit/InputControls/MultiLanguageInput` with `multiline` (and so a multiline `ModelDataTypeLocalizedStringRenderer`)

## What changed

The language codes of a multiline field used to be text inside its label
(`Description - en de fr`), switched by a click. They are now a row of toggle buttons below
the textarea (MUI's `ToggleButtonGroup`, one choice at a time):

- Tab reaches the row, the arrow keys (and Home, End) move between the languages, and
  Enter or Space shows the focused one. The language shown is the pressed button
  (`aria-pressed`), drawn in MUI's selected style instead of in bold. A keyboard focus
  ring marks the focused button.
- Each button is named after its language through its tooltip (e.g. "German Deutsch" in an
  English UI). The row is a group named "Language of <label>" (just "Language" without a
  label), translated in every locale.
- The label shows only the label and the required asterisk. The textarea's name adds the
  shown language, as text that only assistive technology reads: "Description (German)".
- The buttons stay usable while the field is disabled, so the other translations can be
  read.
- A click on a language button keeps the focus on the button. A click on a code in the label
  used to move it into the textarea.

Theme: the `languageLabel` slot now styles those buttons (a `ToggleButton`), not text in the
label, and the new `languageSwitcher` slot styles their group.

## Why

The codes could only be clicked. A keyboard user could edit only the default language, and
nothing told a screen reader user which language the textarea held.

## Migration

- A theme override of `CcMultiLanguageInput`'s `languageLabel` slot now applies to buttons:
  check what it sets. samedis-ui and identity-management-frontend override only
  `languageLabelInputAdornment`, so nothing to do there.
- Tests or scripts that clicked `label [data-lang="de"]` click `button[data-lang="de"]` (or
  the button named after the language) instead.
