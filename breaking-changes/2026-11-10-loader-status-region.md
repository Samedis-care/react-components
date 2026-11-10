# The Loader is a status region

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/Loader`, and everything that shows one (Framework's boot
  fallback, CRUD, Form, FormDialog, FormLoaderOverlay, DataGrid, the selectors, the
  locale selector, the import's validation step, SignalPortlet)

## What changed

The Loader's `root` element has `role="status"`: a polite live region around the text
and the spinner. Its text, or without text the progressbar's name "Loading…", is a
status message that screen readers can announce.

- The region stays the same element while the Loader is shown, so a changed `text`
  ("Validating 2 of 3") is announced as a change.
- `aria-live="off"` on the Loader stops its announcements. It stays a status, and its
  progressbar keeps its name.
- A `role` given to the Loader replaces `"status"`, like the other HTML attributes the
  Loader passes to its root.

## Why

Nothing told a screen-reader user that something was loading (WCAG 4.1.3 Status
Messages): after changing a report filter, opening a dialog whose content loads, or
starting an import's validation, they heard nothing, and found the status text only by
reading on past it.

## Migration

- Nothing required for a single Loader.
- Where many Loaders show at once (one per chart on a report dashboard, one per counter
  in a SignalPortlet), each of them may announce "Loading…". Pass `aria-live="off"` to
  those Loaders. If the page should still say that it loads, give it one status of its
  own, such as a `role="status"` text above the charts:

  ```tsx
  <Loader aria-live={"off"} />
  ```

- Tests: `getByRole("status")` and `findByRole("status")` now also find a Loader that
  is showing. A test that waits for another status message while something loads finds
  the Loader first, or more than one status. Wait for the message instead:

  ```ts
  await waitFor(() =>
  	expect(screen.getByRole("status")).toHaveTextContent(
  		"No data matched your filters.",
  	),
  );
  ```
