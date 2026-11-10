# The Loader's progressbar is named by its text, or "Loading…"

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/Loader`, and everything that shows one (Framework's boot
  fallback, CRUD, Form, FormDialog, FormLoaderOverlay, DataGrid, the selectors, the
  locale selector, SignalPortlet)

## What changed

The spinner's `progressbar` has an accessible name:

- With `text`, the text names it (`aria-labelledby` pointing at the text, whose id
  comes from `React.useId()`, so every Loader on a page keeps its own name).
- Without text (or with `text=""`), it is named "Loading…" in the library's current
  language: the new key `standalone.loader.label`, in every locale. Until the library's
  translations have loaded, the name is the English "Loading…"; the Loader does not
  suspend for them, so it still works as a Suspense fallback.
- An `aria-label` or `aria-labelledby` given to the Loader replaces that name.

## Why

The progressbar had no name. Screen readers announced an unnamed "progressbar" for every
Loader, also when a status text was shown next to it, and axe reported
`aria-progressbar-name` (serious, WCAG 4.1.2) on every Loader.

## Migration

Nothing required. Tests that look for the spinner can find it by name now
(`getByRole("progressbar", { name: "Loading…" })`). A Loader whose text does not say what
is loading can get a more specific name with `aria-label`.
