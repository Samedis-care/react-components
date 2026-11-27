# HowToBox entries stand apart, and a single entry shows without a bullet

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/HowToBox` (`HowToBox`, `HowToBoxTranslate`)

## What changed

- **A gap between entries.** Every entry but the first (theme name `CcHowToBox`, slot `li`)
  has a `margin-top` of half a spacing unit, `theme.spacing(0.5)`: 4px with the default
  spacing. Entries used to touch. A box of five entries is 16px taller.
- **A single entry has no marker.** When a box has one entry (a `labels` value that is not an
  array, or an array with one entry left after the empty ones are skipped), its list (slot
  `ul`) gets the state class `CcHowToBox-singleEntry`, which removes the bullet and the list's
  indent of 1.5rem. The entry is still a list of one item, and `${id}-list` still names the
  list.
- **New: numbered steps.** The new prop `ordered` renders the list as an `<ol>` numbered 1.,
  2., 3. instead of a bulleted `<ul>`. It defaults to `false`, so a box keeps its bullets
  unless it is passed. Theme `variants` of `CcHowToBox` can match `ordered`.

## Why

Entries of several lines ran into each other: on a phone the bullet was the only sign where
one entry ended and the next began. A bullet in front of the only entry of a box, such as a
single tip, marked nothing.

## Migration

Nothing to do; expect a 4px gap between the entries of every HowToBox in screenshots, and no
bullet in a box with one entry.

- A theme that wants another gap sets `marginTop` in `CcHowToBox.styleOverrides.li`; it
  replaces the gap (scope it to `"&:not(:first-of-type)"` to keep the first entry flush).
- A theme that styles the list in `CcHowToBox.styleOverrides.ul` (a marker type, an indent)
  styles the list of a single entry with `"&.CcHowToBox-singleEntry"`; the plain `ul`
  override does not bring the marker back.
- An app whose how-to entries are the steps of a procedure passes `ordered`, or numbers every
  box with `CcHowToBox.defaultProps.ordered: true` in its theme (`ordered={false}` then
  bullets one box). A list that ends with a note, not a step, keeps its bullets or moves the
  note out of the list, so the note is not read as the last step.
