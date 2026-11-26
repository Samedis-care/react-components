# A forced InfoBox has a static header

- **Date:** 2026-11-26
- **Kind:** behavior, theme
- **Scope:** `standalone/InfoBox`

## What changed

While `alwaysExpanded` is `true`, the header is no longer a button:

- The heading is static text in the box's `<h3>`: no `aria-expanded`, no tab stop, and its
  text can be selected and copied. It used to be a focusable toggle announced as
  "expanded" that did nothing.
- A click on the header no longer calls `onChange`. It used to call
  `onChange(event, false)` for a state that never came.
- The header looks as before. It is a `<span>` with the `summary` slot's styles, its
  `classes.summary`, the state classes (`CcInfoBox-status…`, `CcInfoBox-alwaysExpanded`)
  and `Mui-expanded`, but without MUI's `MuiAccordionSummary-*` and `MuiButtonBase-root`
  classes, so a theme's `MuiAccordionSummary` overrides no longer reach it. Its cursor is
  the text cursor over the heading, where it used to be the default arrow.
- When `alwaysExpanded` changes while the header has keyboard focus, the header that
  replaces it takes the focus.

## Why

A forced box cannot be closed, so its header has nothing to toggle. As a button it was a tab
stop without a function, told screen reader users it could be collapsed, and kept its
heading from being selected.

## Migration

Required for any app that passes its open state as `alwaysExpanded` and closes the box from
`onChange` (`alwaysExpanded={open}` with `onChange={(_, next) => setOpen(next)}`): pass that
state as `expanded` instead. Otherwise the box can no longer be closed, because its header
has no button.

```tsx
// before
<InfoBox heading={heading} message={message} alwaysExpanded={open} onChange={(_, next) => setOpen(next)} />
// after
<InfoBox heading={heading} message={message} expanded={open} onChange={(_, next) => setOpen(next)} />
```

Required for any app whose tests find a forced box's header as a button
(`getByRole("button", { name: heading })`): find it as the heading
(`getByRole("heading", { name: heading })`).

Required for any app whose theme styles the header of a forced box through
`components.MuiAccordionSummary` or a `.MuiAccordionSummary-root` / `.MuiButtonBase-root`
selector inside the box: style the `summary` slot (`components.CcInfoBox.styleOverrides.summary`)
or select `.CcInfoBox-alwaysExpanded` instead.

Recommended for any app that shows a notice the user should not close as a box with
`expanded` and no `onChange`: pass `alwaysExpanded` instead (and drop `expanded`), so its
header is static text rather than a toggle that does nothing.
