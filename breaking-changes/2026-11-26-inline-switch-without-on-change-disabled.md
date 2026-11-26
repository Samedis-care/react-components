# An InlineSwitch without onChange is disabled

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/InlineSwitch`, and so the switch of `MultiSelectWithoutGroup`
  with `displaySwitch` but without `setSwitchValue`

## What changed

An InlineSwitch shown (`visible`) without `onChange` is disabled, as with `disabled`: it
cannot be focused or toggled, also not through its label, and switch and label are greyed
out. It still shows `value`. Its switch wrapper has the class `CcInlineSwitch-disabled`;
the root's `CcInlineSwitch-disabled` class still follows only the `disabled` prop.

Before, such a switch looked operable, Tab stopped on it and screen readers announced an
operable switch, but a click or Space changed nothing.

MultiSelectWithoutGroup passes `setSwitchValue` as the switch's `onChange`, so its switch
(`displaySwitch`) without `setSwitchValue` is disabled too. The switches of BaseSelector
and MultiSelectWithTags keep their own state and are not affected.

## Why

A control that ignores every input must not look and be announced as one that takes it
(WCAG 4.1.2 Name, Role, Value).

## Migration

Nothing changes for a switch with `onChange` (or `setSwitchValue`). A switch without one
could not be toggled before either; it is greyed out now. Required for any app that renders
such a switch for the user to toggle: pass the handler and the value it sets, e.g.

```tsx
const [showInactive, setShowInactive] = useState(false);

<MultiSelectWithoutGroup
	{...selectorProps}
	displaySwitch
	switchLabel={t("show-inactive")}
	switchValue={showInactive}
	setSwitchValue={setShowInactive}
/>;
```

A switch that only shows a state the user cannot change here needs nothing.
