# The Loader's status text is a paragraph, not a heading

- **Date:** 2026-11-12
- **Kind:** behavior
- **Scope:** `standalone/Loader`, wherever a Loader shows a `text`

## What changed

The Loader's `text` is a `<p>` in every `typographyVariant`. Before, its element came
from Typography's variant mapping: an `<h6>` for the default `h6` and for `subtitle1`
and `subtitle2`, `<h1>`–`<h5>` for `h1`–`h5`, a `<span>` for `caption`, `button`,
`overline` and `inherit`. The text keeps its `MuiTypography-<variant>` class and its
look.

## Why

The status text was a heading. Screen readers listed "Loading data…" among the page's
headings for as long as it loaded, and below a page or dialog title (`<h2>`) the heading
level jumped from 2 to 6.

## Migration

- Nothing required for the look.
- A theme or `sx` that styles the text by its element (`& h6`, `& span`) no longer
  matches it. Select its class instead: `& .MuiTypography-root`, or the variant's
  `& .MuiTypography-subtitle1`.
- Tests that find the text as a heading
  (`getByRole("heading", { name: "Loading data…" })`) find nothing now. Find it by its
  text, or find the spinner, which the text names:

  ```ts
  screen.getByText("Loading data…");
  screen.getByRole("progressbar", { name: "Loading data…" });
  ```
