# FlowEngineBackButton has no default label: children are required

- **Date:** 2026-11-13
- **Kind:** type
- **Scope:** `backend-components/Form/FlowEngine` (`FlowEngineBackButton`, `FlowEngineBackButtonProps`)

## What changed

`FlowEngineBackButtonProps.children`, the button's label, is required. A `FlowEngineBackButton`
without children no longer compiles (TS2741, "Property 'children' is missing"). The default
label "Back" (`common.buttons.back`) is gone. What the button does is unchanged: it calls the
Form's `goBack` and leaves the whole flow.

## Why

The button leaves the whole flow, not only the current stage, and whether that reads as
"Cancel" or "Back" depends on where it sits. In a step of a wizard, next to "Next", "Back"
reads as "previous step", and a screen reader announces "Back, button" for a button that closes
the flow; there the label is "Cancel". On a final form opened from a list, "Back" can be right.
A label has to say what the control does (WCAG 2.4.6 Headings and Labels), so every use names
it.

## Migration

Required for every `FlowEngineBackButton` without children: pass the label. Without it the app
does not compile.

samedis.care has three such uses, each `renderBack && <FlowEngineBackButton key={"back"} />`:

- `src/pages/TenantSpecific/Devices/Data/components/Form/InventoryEditForm.tsx` (Inventory, stage "edit")
- `src/pages/TenantSpecific/Devices/Data/components/Form/InventoryDeviceReviewForm.tsx` (Inventory, stage "device review")
- `src/pages/TenantSpecific/Facility/TestEquipment/components/TestEquipmentEditForm.tsx` (Test equipment, stage "edit"; in the create flow it follows the device selection, so "Cancel" fits there, "Back" when editing)

Pass the label from the app's translations, e.g. "Back" to keep today's text:

```tsx
const { t: tCommon } = useTranslation("common");

renderBack && (
	<FlowEngineBackButton key={"back"}>{tCommon("buttons.back")}</FlowEngineBackButton>
);
```

The other uses already pass a label and are unchanged.
