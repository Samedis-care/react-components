# SignalPortlet shows no "Last refresh" label for 0 or an invalid time

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/SignalPortlet`

## What changed

SignalPortlet's `updatedAt` now hides the "Last refresh" label for every value that is no
time: `null`, `undefined`, `NaN`, an invalid Date (`new Date("garbage")`) and 0, the epoch,
as a number or as `new Date(0)`. Before:

- `0` and `NaN` next to an `onRefresh` button printed a stray "0" or "NaN" in the footer.
- An invalid Date showed "Last refresh: NaN day ago", with "Invalid Date" in the tooltip.
- `new Date(0)`, which is what `new Date(null)` gives, showed the age of 1 January 1970
  ("Last refresh: 20770 days ago" on the day of this change).

With an `onRefresh` button, the footer shows only the button in these cases. Without one,
there is no footer.

## Why

These values carry no refresh time. react-query's `dataUpdatedAt` is 0 until the first
successful fetch, so a card fed with it showed "0" next to Refresh while its first load ran,
and kept showing it if that load failed. A missing or unparsable date from an API showed a
nonsensical age.

## Migration

Nothing to do. `updatedAt={query.dataUpdatedAt}` can be passed as it is, and guards such as
`dataUpdatedAt || undefined` can go. Expect the stray "0", "NaN" and 1970 ages to be gone
from screenshots.
