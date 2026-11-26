# A selector's switch is described by the selector's label

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** the switch of every selector with a `label`: `BaseSelector`, `SingleSelect`,
  `MultiSelect`, `MultiSelectWithoutGroup` and `MultiSelectWithTags` (`displaySwitch`), the
  backend selects (`switchFilterName`, `switchFilterNameGroup`, `switchFilterNameData`) and
  the CRUD and form selects built on them

## What changed

The selector's `label` is now the accessible description of its switch: the switch's
`<input role="switch">` gets `aria-describedby="<id>-label"`, the id of the label element
the selector already renders. The switch's name stays `switchLabel`.

- On `BaseSelector` and the selectors built on it, `<id>` is `autocompleteId` or, without
  one, the id generated for the selector, as for the combobox.
- `MultiSelectWithoutGroup` (and `MultiSelectWithTags` through it) describes the switch by
  the label of its search field (`label`, `searchInputLabel` on `MultiSelectWithTags`).
  Without an `autocompleteId` it now generates the search field's id itself.

A selector without `label` leaves its switch without a description. Nothing changes
visually.

## Why

Two selectors with the same switch, e.g. "Device type" and "Responsible person" each with
"Show inactive", were announced as two identical "Show inactive, switch, off" controls, not
tied to the field they filter (WCAG 1.3.1 Info and Relationships, 2.4.6 Headings and
Labels). They are now announced as "Show inactive, switch, off, Device type" and "Show
inactive, switch, off, Responsible person".

## Migration

Nothing required. A test can tell the switches apart by their description:
`getByRole("switch", { name: "Show inactive", description: /Device type/ })`.
