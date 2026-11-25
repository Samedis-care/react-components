# GroupBox applies `classes.legend`

- **Date:** 2026-11-20
- **Kind:** behavior, theme
- **Scope:** `standalone/GroupBox`; through the theme's `defaultProps`, also the frames of
  FileUpload, ImageSelector, MultiImage, HowToBox and the files and string-array renderers

## What changed

`classes.legend` is added to the GroupBox's `<legend>`, from the `classes` prop and from
`components.CcGroupBox.defaultProps.classes`. Before, the key was accepted and typed, but
its class name was dropped. With `smallLabel` set, the legend gets `classes.legend` and
`classes.smallLabel`.

As on MUI components, a `classes` prop replaces the `classes` of the theme's
`defaultProps` rather than adding to them.

## Why

`legend` is a key of `GroupBoxClassKey`, and `classes.root` and `classes.smallLabel`
already reached their elements. Only the legend got no class name, so an app could not
style the title of one GroupBox without a theme override.

## Migration

Nothing required. A GroupBox that passes `classes.legend`, or a theme that sets
`components.CcGroupBox.defaultProps.classes.legend`, gets those styles now: check that
the legends look as intended.
