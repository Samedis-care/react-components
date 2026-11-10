# useCountryOptions gives each country a CountryFlag as its icon

- **Date:** 2026-11-10
- **Kind:** type, behavior
- **Scope:** `standalone/CountryFlags` (`useCountryOptions`, `CountryOption`), `standalone/CountryFlag` (new)

## What changed

`CountryOption.icon` is a React element, `<CountryFlag code={value} />`, instead of the URL
of the flag (`CountryFlags[value]`). Its type changed from `string` to `React.ReactElement`.

In a Selector with `enableIcons`, the countries' flags now look the way the new
`CountryFlag` component draws them, in the options and before the selected value:
16px high (`1rem`), as wide as the flag's aspect ratio needs, in a 32x16 box, with a 1px
outline in `theme.palette.divider`. They used to be fitted into a 32x32 box without an
outline. The Selector's `iconSize` does not apply to them, because it only sizes string
icons.

## Why

Without a frame, flags whose edge is white lost their shape on a white menu (Japan
showed as a red dot, South Korea as a floating emblem, Cyprus as an orange island), and
in dark mode black edges did the same (Germany's top stripe). In the square box the
flags' heights also varied from 12.6px (Qatar) to 32px (Nepal).

## Migration

Nothing is required in samedis-ui or identity-management-frontend: neither uses
`useCountryOptions` yet.

Code that reads `option.icon` as a URL takes `CountryFlags[option.value]` instead. A
select that builds its own country options can show the same flags with
`icon: <CountryFlag code={code} />`.
