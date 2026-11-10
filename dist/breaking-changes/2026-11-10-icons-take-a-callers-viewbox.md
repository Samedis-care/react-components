# FilterIcon, SignIcon and ExportIcon take a caller's viewBox

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/Icons` (`FilterIcon`, `SignIcon`, `ExportIcon`)

## What changed

A `viewBox` passed to one of these icons now reaches its `<svg>` and replaces the icon's own
viewBox, as a `viewBox` passed to a Material icon replaces SvgIcon's `0 0 24 24`. It used to
be dropped: the icon's own viewBox always won. Without a `viewBox` prop, or with
`viewBox={undefined}`, an icon draws in its own viewBox as before.

A caller's viewBox is in the glyph's coordinates, not on the 24-unit grid of a Material icon:

| Icon         | Own viewBox (the default)     | Bounds of the glyph |
| ------------ | ----------------------------- | ------------------- |
| `FilterIcon` | `-4.347 -4.337 34.693 34.693` | `0 0 26 26.02`      |
| `SignIcon`   | `-6 -6 48 48`                 | `0 0 36 36`         |
| `ExportIcon` | `-8.1 -3.6 43.2 43.2`         | `0 0 27 36`         |

For example, `<ExportIcon viewBox="0 0 27 36" />` draws the glyph edge to edge, without the
padding of the default.

## Why

A caller's viewBox is how an app pads or crops an icon. It worked on Material icons but not
on these, so the same code padded or cropped the Material icons and left these unchanged.

## Migration

Nothing is required: neither the library nor samedis-ui nor identity-management-frontend
passes a `viewBox` to these icons.

Code that passes a `viewBox` to one of them, which had no effect so far, now changes how the
glyph is drawn. Remove the prop to keep the current look.
