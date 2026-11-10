# The Loader passes `className` and HTML attributes on, so `styled(Loader)` and FormLoaderOverlay's `loader` override apply

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/Loader`, `standalone/Form/FormLoaderOverlay`

## What changed

- `className` reaches the Loader's `root` slot (its outermost box). The styles of
  `styled(Loader)` and of `components.CcFormLoaderOverlay.styleOverrides.loader` now apply
  to it, and win over the Loader's own `root` styles. Before, they were dropped.
- The other HTML attributes of a `div` (`id`, `style`, `data-*`, `aria-*`, event handlers)
  go to the `root` slot as well, except `aria-label` and `aria-labelledby`, which name the
  spinner's progressbar. Before, the Loader dropped all of them, although they compiled.
- New props: `classes`, with one key per slot of `LoaderClassKey` (`root`, `innerWrapper`,
  `progress`), and `sx`, which styles the `root` slot.

## Why

The Loader rendered none of the props it did not know. So `styled(Loader)` had no effect,
the typed `loader` slot of `CcFormLoaderOverlay` never applied, and an app could neither
name the spinner, find the Loader by test id, nor size or position it without a wrapping
box.

## Migration

Nothing required. A theme that sets `components.CcFormLoaderOverlay.styleOverrides.loader`,
a `styled(Loader)`, or a Loader with `aria-*` or `data-*` attributes takes effect now:
check that it looks and reads as intended.

A box that wraps a Loader only to size or position it can go: pass `sx` or `className` to
the Loader instead.
