# The busy overlay's focus ring shows at once; what fades in is the wash's color and its spinner

- **Date:** 2026-11-26
- **Kind:** behavior, theme
- **Scope:** `standalone/Form/FormLoaderOverlay`

## What changed

- When `FormLoaderOverlay` wraps `children` and takes the keyboard focus from them, its
  focus ring shows as soon as the focus moves to the wash. It used to show only once the
  wash had faded in, 1s later, and not at all when the busy phase ended sooner.
- What fades in 1s after every show is the wash's color (the root's `background-color`) and
  the spinner (the `loaderAnchor` slot's `opacity`), no longer the root as a whole: the root
  is no longer transparent while it waits. Anything else a theme draws on the root, such as
  a border, a shadow or a background image, shows as soon as the overlay is shown.
- The fade-in is `theme.transitions.create(["background-color", "opacity"], …)` on the
  root, with the same duration, easing and 1s delay as before; the `loaderAnchor` slot takes
  the root's transition (`transition: inherit`). A theme that sets the root's `transition`,
  such as `none` in a variant on `visible`, sets the spinner's with it.
- Every fade starts from a transparent wash, whatever color the theme gives it (in the
  root's override, the shown state's override or a variant on `visible`): the wash's color
  is transparent while the overlay is hidden and at the start of every show, through
  `!important` declarations that a theme's override does not change.
- The `loaderAnchor` slot is rendered while the overlay is hidden too, empty and
  transparent, with `classes.loaderAnchor`; the spinner in it (`loader`) only while the
  overlay is visible, as before.

## Why

The focus ring is drawn on the root, and the root stayed transparent for the first second
of every show: keyboard focus that moved to the wash had no visible indicator (WCAG 2.4.7
Focus Visible). A keyboard user who started a save or an import whose content the overlay
wraps saw the focus nowhere until the wash faded in, or at all when it ended sooner.

## Migration

Nothing to do for a theme that leaves the overlay's root as it is or only changes the
wash's color: the wash fades in as before.

A theme that draws more than a color on the root (a border, a shadow, a background image):
expect it to show as soon as the overlay is shown, together with the focus ring, and no
longer to fade in with the wash.
