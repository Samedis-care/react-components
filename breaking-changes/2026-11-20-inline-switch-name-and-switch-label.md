# InlineSwitch takes aria props for its switch, and a selector's switch requires switchLabel

- **Date:** 2026-11-20
- **Kind:** behavior, type
- **Scope:** `standalone/InlineSwitch`, and so the switch of every selector: `BaseSelector`, `MultiSelect`, `MultiSelectWithoutGroup` and `MultiSelectWithTags` (`displaySwitch`), the backend selects (`switchFilterName`, `switchFilterNameGroup`, `switchFilterNameData`) and the CRUD and form selects built on them

## What changed

- `InlineSwitch` has typed `"aria-label"`, `"aria-labelledby"` and `"aria-describedby"` props. They reach the switch's `<input role="switch">`: `aria-label` or `aria-labelledby` names a switch that has no `label`, and `aria-describedby` attaches its help text. All three were dropped before.
- The new `slotProps.input` takes the input's other attributes (`id`, `name`, …), as on MUI's `Switch`. The typed aria props above win over it, and `aria-describedby` is appended to its own.
- A selector's `switchLabel` is required while the selector shows its switch: with `displaySwitch`, or with `switchFilterName`, `switchFilterNameGroup` or `switchFilterNameData` on the backend selects. `switchLabel` is the switch's visible text and its accessible name.

Nothing changes visually. A selector without a switch works as before, but its props type is
now a union (with or without a switch), which changes how a wrapper derives its props from it
(see Migration).

## Why

`label` was the switch's only accessible name, and it is optional. A switch without it, or a
selector switch without `switchLabel`, was announced as "switch, off" with no purpose, and axe
reported `label` (critical, WCAG 4.1.2 Name, Role, Value). An `aria-label` given to
`InlineSwitch` compiled (hyphenated JSX attributes are not type-checked) but never reached the
input. MUI's own `Switch` takes these attributes through `slotProps.input`.

A selector switch is a visible control, so its label is required rather than hidden: without a
visible label a sighted user has nothing to go by either.

## Migration

Required for a selector whose switch shows without a `switchLabel`: `displaySwitch` on
`BaseSelector`, `MultiSelect`, `MultiSelectWithoutGroup` and `MultiSelectWithTags`;
`switchFilterName` on `BackendSingleSelect`, `BackendMultiSelect` and `BackendMultipleSelect`;
`switchFilterNameGroup` or `switchFilterNameData` on `BackendMultiSelectWithTags`. Pass
`switchLabel`, the switch's visible text and accessible name:

```tsx
<SingleSelect label="Device type" … displaySwitch switchLabel="Show inactive" />
<BackendSingleSelect model={…} switchFilterName="include_inactive" switchLabel="Show inactive" … />
```

Without it the selector's props no longer compile (`switchLabel` is missing), and a switch
rendered anyway has no visible text and no accessible name.

**Required for a wrapper that derives its props from a selector's props with `Omit`**
(`Omit<BackendSingleSelectProps<M>, "model" | …>`, or an `interface` that extends such an
`Omit`), even if it never shows a switch. The selectors' props are a union now, and `Omit`
collapses it into one object type (`switchFilterName?: string`, `switchLabel?: ReactNode`) that
no longer fits back into the selector. Derive them with `DistributiveOmit`, exported from the
package root. An `interface` cannot extend a union, so it becomes a `type` with an
intersection:

```tsx
import type { DistributiveOmit } from "components-care";

// before
interface DeviceSelectorProps extends Omit<
	BackendSingleSelectProps<DeviceModel>,
	"model" | "modelToSelectorData"
> {
	tenantId: string;
}

// now
type DeviceSelectorProps = DistributiveOmit<
	BackendSingleSelectProps<DeviceModel>,
	"model" | "modelToSelectorData"
> & { tenantId: string };
```

A theme's `defaultProps` or a test double that spreads its props into a selector can use
`PartialExcept`, also exported from the root, which keeps `switchLabel` required next to a
switch.

Nothing to do for an `InlineSwitch` that has a `label`, or that shows no switch. Code that
named a bare `InlineSwitch` with `aria-label` now gets a typed prop; `slotProps.input` carries
its `id`, `name` and other input attributes.
