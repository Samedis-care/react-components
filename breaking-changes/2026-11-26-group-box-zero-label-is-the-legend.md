# A GroupBox label of `0` is its legend, and `label={true}` draws none

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/GroupBox`; through it, the frames of HowToBox, FileUpload,
  ImageSelector, MultiImage and the files and string-array renderers

## What changed

- A `label` of `0` or `NaN` is the frame's `<legend>` and names the group, as React renders
  it ("0", "NaN"). It used to give no legend: the value was printed as a bare line of text
  at the top of the frame, above the content, and the group had no name.
- `label={true}` renders no legend. It used to render an empty one, which left a gap in the
  frame's top border.
- `null`, `undefined`, `false` and `""` render no legend, as before. Any element renders a
  legend, as before.

## Why

`label` is a `ReactNode`, and the legend was drawn only for a truthy label. A count or
number held as a number showed at 0 as stray text that read like content, and the frame lost
its title. A legend is now drawn for every label that React renders as something, the rule
HowToBox already applies to its entries.

## Migration

Nothing to do for string, translated or element labels.

**Required for apps that pass a number as `label` and want no title at 0.** Such a frame now
shows "0" as its title. Pass `null` for 0, e.g. `label={count > 0 ? count : null}`.
