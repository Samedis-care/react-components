# A line break in a HowToBox entry starts a new line

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/HowToBox` (`HowToBox`, `HowToBoxTranslate`); where the library
  shows it: the first step of the CRUD import (`importHowTo`)

## What changed

The entries of a HowToBox (theme name `CcHowToBox`, slot `li`) now set
`white-space: pre-line`. A line break `"\n"` in an entry starts a new line inside the same
list item. It used to be collapsed to a space, so the text after it continued the previous
sentence on the same line. Other runs of white space still collapse to one space, and entries
without a line break are laid out as before.

## Why

A string in a translation array cannot hold markup, so `"\n"` is the only way to break a
line inside one entry. samedis-ui's employee import uses it in every locale to put the list
of required fields on a line of its own; it ran into the sentence before it. InfoBox already
shows line breaks in its text the same way.

## Migration

Nothing to do. Entries that contain `"\n"` get taller, so expect them to look different in
screenshots: in samedis-ui, the first entry of the employee import's how-to (`staff.json` ›
`import-how-to-help`).

An entry that should stay on one line must not contain `"\n"`. A theme that wants the old
behavior back can set `whiteSpace: "normal"` in `CcHowToBox.styleOverrides.li`.
