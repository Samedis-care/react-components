# HowToBox shows its default title only for an omitted `titleLabel`; `null` and `""` show no title

- **Date:** 2026-11-26
- **Kind:** behavior, type
- **Scope:** `standalone/HowToBox` (`HowToBox`, `HowToBoxTranslate`)

## What changed

- `HowToBox`: only an omitted (`undefined`) `titleLabel` shows the default title "How it works"
  (or a theme's `defaultProps.titleLabel`). Every other value is the `label` of the GroupBox
  frame, so `titleLabel={null}` now shows no title, as `""` and `false` already did. It used to
  show "How it works".
- `HowToBoxTranslate`: `titleLabel=""` now shows no title; it used to show "How it works".
  `titleLabel` also takes `null`, which shows no title too. An omitted `titleLabel` still shows
  the default title, and a key still shows its translation.

## Why

One rule for "default title" and "no title" across `GroupBox`, `HowToBox` and
`HowToBoxTranslate`: a default fills an omitted prop only, as MUI's own default props and theme
`defaultProps` do, and `null` shows nothing, as `GroupBox`'s `label={null}` does.

## Migration

Required for any app that passes `titleLabel={null}` to `HowToBox`, or `titleLabel=""` to
`HowToBoxTranslate`, and wants the default title: leave the prop out (or pass `undefined`).
Without that, the box shows no title.

```tsx
// before: the default title
<HowToBox titleLabel={null} labels={steps} />
// now
<HowToBox labels={steps} />
```

A box without a title is a group without a name: give it an `aria-label` where it needs one.
