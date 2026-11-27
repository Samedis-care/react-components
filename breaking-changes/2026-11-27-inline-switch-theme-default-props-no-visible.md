# InlineSwitch's theme defaults leave out `visible`

- **Date:** 2026-11-27
- **Kind:** type
- **Scope:** `standalone/InlineSwitch` (`components.CcInlineSwitch.defaultProps`, `InlineSwitchThemeProps`)

## What changed

`InlineSwitchThemeProps`, the type of `components.CcInlineSwitch.defaultProps`, no
longer takes `visible`. A theme still sets `disabled`, `label`, `aria-label`,
`className`, `classes` and `slotProps`. `visible` stays required on every InlineSwitch.
Nothing changes at runtime.

## Why

`visible` says whether one container shows its switch. Every InlineSwitch passes it (the
selectors pass their `displaySwitch`), and a value passed to the component wins over the
theme's default, so a `visible` set in the theme never applied.

## Migration

Required for any app whose theme sets `visible` in `components.CcInlineSwitch.defaultProps`:
the theme no longer compiles. Remove `visible` from the theme. It had no effect, so nothing
else changes; each InlineSwitch keeps passing its own:

```tsx
<InlineSwitch value={showInactive} onChange={setShowInactive} visible label="Show inactive" />
```

Other apps: nothing to do.
