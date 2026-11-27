# InfoBox's headingVariant sets only the look, and headingComponent sets the box's heading

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/InfoBox`

## What changed

- The heading text is a `<span>` in every `headingVariant`. Before, its element came from
  Typography's variant mapping: `<h1>`–`<h6>` for `h1`–`h6`, `<h6>` for `subtitle1` and
  `subtitle2`, `<p>` for `body1`, `body2` and `inherit`, and a `<span>` for `caption` (the
  default), `button`, `overline` and a theme's own variants. The text keeps its
  `MuiTypography-<variant>` class and its look: it is a block (`display: block`) in every
  variant.
- The header's content (`summaryRoot` slot) is a `<span>` with `display: block`; it was a
  `<div>`. It looks as before.
- New prop `headingComponent` (default `"h3"`): the element of the box's heading, which
  holds the header, like the `component` of MUI Accordion's `heading` slot. `"h1"`–`"h6"`
  set the level; another element, e.g. `"div"`, makes the box no heading. A theme can set
  it for every box through `components.CcInfoBox.defaultProps.headingComponent`.

## Why

A `headingVariant` such as `h6` or `subtitle1` put a second heading into the header
button, inside the box's `<h3>`: screen readers listed the heading twice, at levels 3
and 6, and the page's outline jumped from 3 to 6. `body1` and `body2` put a `<p>`, and the
header always a `<div>`, into the button, which may hold phrasing content only. The box's
heading was always an `<h3>`, so right below a page's `<h1>` the outline skipped level 2.

## Migration

- Nothing required for the look.
- Required for any app whose tests find an InfoBox heading by a level other than 3
  (`getByRole("heading", { level: 6, name })` for `headingVariant="h6"`): find the box's
  heading instead, which is of level 3 unless `headingComponent` sets another:

  ```ts
  screen.getByRole("heading", { name: "Maintenance due" });
  ```

- Required for any app whose theme or `sx` styles an InfoBox's heading or header content
  by element (`& h6`, `& p`, `& div`): select a class instead (`& .MuiTypography-root`,
  `& .MuiTypography-h6`), or style the `heading` and `summaryRoot` slots through
  `components.CcInfoBox.styleOverrides` or `classes`.
- Recommended for any app that shows an InfoBox where an `<h3>` does not fit the page's
  outline (right below the page's `<h1>`, or below an `<h3>` of its own): pass the level
  that fits, e.g. `headingComponent="h2"`. A notice that should not appear in the outline
  takes `headingComponent="div"`.
