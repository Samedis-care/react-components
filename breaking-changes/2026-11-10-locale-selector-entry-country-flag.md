# LocaleSelectorEntry shows its flag as a CountryFlag

- **Date:** 2026-11-10
- **Kind:** type, behavior
- **Scope:** `non-standalone/LocaleSelector` (`LocaleSelectorEntry`, `LocaleSelectorEntryClassKey`)

## What changed

The flag of a language dialog row is a `CountryFlag` with `size={30}`: 30px high in a
60x30 box, as before, but outlined in `theme.palette.divider` instead of a 1px
`lightgray` border. The outline does not take space, so the flag is no longer 2px larger
than its box.

The theme slots `imageWrapper` (the box) and `image` (the `img`) of
`CcLocaleSelectorEntry` are replaced by one slot, `flag`, on the `CountryFlag`'s box.
`LocaleSelectorEntryClassKey` is now
`"root" | "container" | "flag" | "textContainer" | "text"`.

## Why

The grey border ignored the palette (it stayed light grey in dark mode), and the
library showed flags differently in every component. All flags now come from
`CountryFlag`, which keeps white-edged and, in dark mode, black-edged flags in shape.

## Migration

Nothing is required in samedis-ui or identity-management-frontend: neither overrides
these slots.

A theme that styles `components.CcLocaleSelectorEntry.styleOverrides.imageWrapper` moves
those styles to `flag`. Styles for the `img` (`image`) go to
`components.CcCountryFlag.styleOverrides.image`, which applies to every flag, or to
`flag` as `"& img": { … }` for the language dialog only.
