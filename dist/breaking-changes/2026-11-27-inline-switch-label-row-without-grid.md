# InlineSwitch's switch row is a `<label>` of spans, not a MUI Grid

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/InlineSwitch`, and so the switch of the selectors (`displaySwitch`)

## What changed

The row of switch and label inside `CcInlineSwitch-switchWrapper` is a `<label>` holding
two `<span>`s, the switch's and the label text's, laid out as a flex row. Before, it was
a MUI `Grid` container rendered as the `<label>`, with two `Grid` items rendered as
`<div>`s. The switch and its label look and behave as before.

The row and its parts no longer have MUI's `MuiGrid-*` classes, and a theme's
`components.MuiGrid` defaults and overrides no longer reach them.

## Why

A `<label>` may hold phrasing content only, so the `<div>`s inside it made the markup
invalid HTML.

## Migration

Required for any app with a rule that selects the switch row or its parts through MUI's
Grid classes (e.g. `.CcInlineSwitch-switchWrapper .MuiGrid-container > :last-child`): the
rule matches nothing now. Select them as `.CcInlineSwitch-switchWrapper > label` (the
row), `.CcInlineSwitch-switchWrapper > label > :first-child` (the switch's cell) and
`.CcInlineSwitch-switchWrapper > label > :last-child` (the label's text).

Other apps: nothing to do.
