# The status region under a CRUD select stays in the page, and says "Loading…" once the load takes 100ms

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`CrudMultiSelect`, `CrudMultiSelectWithGroups`),
  `backend-components/Form/CrudControls` (`FormCrudMultiSelect`)

## What changed

Under the field of a CRUD select there is now always a status region (`role="status"`, a
`div`), from the field's mount to its unmount. Only its text changes: "Loading…" while the
selection loads, "Saving…" while a change of it is being written, and nothing otherwise.
Empty, it takes no room. Before, the status line was added together with its text and
removed again when it had nothing to say.

"Loading…" shows once the field has been in the page for 100ms: a load that takes less
shows no status. "Saving…" shows at once, as before.

The alert after a failed load is unchanged. It comes after the status region, which is
empty then.

## Why

A screen reader announces a change of a live region's text, but not every one announces a
region that is added with its text already in it, so "Loading…" and "Saving…" were not
always announced (WCAG 4.1.3 Status Messages). A new region is picked up with a delay,
which "Loading…", shown as the field mounts, waits for.

## Migration

Nothing required. Screens look the same.

- A test that expects no status under a CRUD select (`queryByRole("status")` is `null`)
  finds the empty region: check that its text is empty instead
  (`expect(screen.getByRole("status")).toHaveTextContent(/^$/)`). On a page with another
  status region, `getByRole("status")` finds both: look the one you want up by its text.
- A test that expects "Loading…" right after a CRUD select mounted has to wait for it
  (`await screen.findByText("Loading…")`). A connector that answers within 100ms never
  shows it.
- A CRUD select renders the status region after its field, as a sibling. A parent that
  spaces its children (a flex or grid container with `gap`, a MUI `Stack`) puts that space
  before the empty region too: wrap the select in a `div` there.
