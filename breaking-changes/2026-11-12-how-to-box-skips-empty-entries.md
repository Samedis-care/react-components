# A HowToBox skips entries that render nothing

- **Date:** 2026-11-12
- **Kind:** behavior
- **Scope:** `standalone/HowToBox` (`HowToBox`, `HowToBoxTranslate`); where the library
  shows it: the first step of the CRUD import (`importHowTo`)

## What changed

Entries of `labels` that React renders as nothing, `undefined`, `null`, `""`, `false` and
`true`, are skipped. `labels={["first", "", null, "last"]}` now renders two list items, and
used to render four, two of them empty bullets. `HowToBoxTranslate` skips empty strings in
the translated array the same way.

The same rule decides whether the box shows at all:

- An array whose entries are all skipped (`[null, ""]`) renders nothing, as an empty array
  does. It used to render the frame around empty bullets.
- `labels={true}` renders nothing. It used to render the frame around one empty bullet.
- `labels={0}` renders the frame with one entry "0", as `labels={[0]}` already did and as
  React renders `0`. It used to render nothing.

## Why

Conditional steps (`[a, isAdmin && b, c]`) and translation arrays with an empty string are
the usual sources of such entries. Sighted users saw bare bullets between the steps, and
screen readers announced a list with more items than steps and read the empty ones as blank.

## Migration

Nothing to do for arrays: an entry that was an empty bullet is gone, so expect shorter
lists in screenshots where an entry was empty.

Code that passes a number as `labels` and relied on `0` hiding the box has to pass
`undefined` instead, e.g. `labels={count > 0 ? steps : undefined}` rather than
`labels={count && steps}`.

The CRUD import step still treats an `importHowTo` whose entries are all skipped as a
how-to: it keeps the data preview hidden. Pass `undefined` instead to get the preview.
