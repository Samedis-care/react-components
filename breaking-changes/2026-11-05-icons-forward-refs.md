# The icons forward refs on React 18

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `standalone/Icons`

## What changed

`FilterIcon`, `FilterActiveIcon`, `SignIcon`, `TuneIcon`, `ResetIcon`, `ExportIcon`,
`AppsIcon` and `SuccessOutlinedIcon` are `React.memo(React.forwardRef(...))` now, as MUI's
own icons are. A `ref` passed to one of them resolves to its `<svg>` element on React 18
too. It used to stay `null` there.

Two things follow on React 18:

- React no longer logs `Function components cannot be given refs` for an icon given a
  `ref`.
- A `Tooltip`, `Popper` or `Menu` placed directly around an icon, or anchored to it, gets
  the element, so a tooltip around an icon opens on hover.

On React 19 nothing changes: the ref already reached the `<svg>` there.

## Why

The icons were plain function components inside `React.memo`. Their props type, MUI's
`SvgIconProps`, includes `ref`, so passing one compiled. React 18 does not hand a ref to a
plain function component, so it was dropped.

## Migration

Nothing to do. A tooltip that never showed on React 18 because it wraps an icon directly
now shows.
