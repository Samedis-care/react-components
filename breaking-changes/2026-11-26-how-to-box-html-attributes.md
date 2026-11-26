# HowToBox takes any fieldset attribute, `sx` and `ref`, and its list gets an id from `id`

- **Date:** 2026-11-26
- **Kind:** behavior, type
- **Scope:** `standalone/HowToBox` (`HowToBox`, `HowToBoxTranslate`)

## What changed

- `HowToBoxProps` extends `GroupBoxHTMLProps`. Every HTML attribute HowToBox does not take
  itself (`id`, `aria-label`, `aria-describedby`, `style`, `data-*`, event handlers, …) is
  set on its frame, the `<fieldset>`, as on a `GroupBox`. They used to be dropped.
- `sx` styles the frame, after the theme's `styleOverrides.root` and `variants`.
- HowToBox is `React.memo(React.forwardRef(...))`: a `ref` gets the fieldset, also on
  React 18.
- With an `id`, the list of entries (`<ul>`) gets the id `` `${id}-list` ``. A control
  whose `aria-describedby` points at it is described by the entries.
- `HowToBoxTranslate` passes these props on to its HowToBox.
- `components.CcHowToBox.defaultProps` accepts the same attributes.

## Why

A control could not be described by the instructions above it: an `id` given to HowToBox
was dropped. A box without a title (`titleLabel=""`) is a group without a name, and an
`aria-label` for it was dropped as well. The list gets its own id because a fieldset
referenced by `aria-describedby` contributes only its accessible name, the title, not the
entries.

## Migration

Nothing to do. To have a control described by a box's steps, give the box an `id` and
point the control's `aria-describedby` at `` `${id}-list` ``:

```tsx
<HowToBox id={"import-how-to"} labels={steps} />
<Button aria-describedby={"import-how-to-list"}>{t("upload")}</Button>
```
