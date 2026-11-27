# InlineSwitch's theme defaults leave out the props of a single switch

- **Date:** 2026-11-27
- **Kind:** type
- **Scope:** `standalone/InlineSwitch` (`components.CcInlineSwitch.defaultProps`)

## What changed

`components.CcInlineSwitch.defaultProps` is typed with the new `InlineSwitchThemeProps`
(each prop optional) instead of all of `InlineSwitchProps`. It no longer takes the props
of a single switch:

- `value` and `onChange`, the switch's state and its handler
- `children`, the content of the container
- `aria-labelledby` and `aria-describedby`, the ids of elements next to one switch

A theme still sets `visible`, `disabled`, `label`, `aria-label`, `className`, `classes`
and `slotProps`. `InlineSwitchThemeProps` is exported from the package root. Nothing
changes at runtime.

## Why

A theme default applies to every InlineSwitch, also to the one each selector renders
around its field, so a value, a handler, content or an id set there would be shared by
all of them. The selectors' theme props (`BaseSelectorThemeProps` and those of the
backend selectors) leave out their per-instance props the same way.

## Migration

Required for any app whose theme sets `value`, `onChange`, `children`,
`aria-labelledby` or `aria-describedby` in `components.CcInlineSwitch.defaultProps`: the
theme no longer compiles. Remove them from the theme and pass them to each InlineSwitch:

```tsx
<InlineSwitch
	value={showInactive}
	onChange={setShowInactive}
	visible
	label="Show inactive"
/>
```

Other apps: nothing to do.
