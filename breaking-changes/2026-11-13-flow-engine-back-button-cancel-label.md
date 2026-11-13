# FlowEngineBackButton is labelled "Cancel" by default

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `backend-components/Form/FlowEngine` (`FlowEngineBackButton`)

## What changed

A `FlowEngineBackButton` without `children` is labelled with the translated "Cancel"
(`common.buttons.cancel`: Cancel, Abbrechen, Annuler, …) instead of "Back"
(`common.buttons.back`). What it does is unchanged: it calls the Form's `goBack` and leaves
the whole flow. `children` still replace the label.

## Why

The button does not go to the previous stage, it leaves the form. In a wizard footer next to
a "Next" button, "Back" reads as "previous step", and a screen reader on step 2 announces
"Back, button" for a button that closes the flow. A label has to say what the control does
(WCAG 2.4.6 Headings and Labels).

## Migration

Nothing required. A `FlowEngineBackButton` that passes its own label is unchanged.

samedis.care: three stages use the default label and now show "Cancel":

- Inventory, stage "edit" (`InventoryEditForm`)
- Inventory, stage "device review" (`InventoryDeviceReviewForm`)
- Test equipment, stage "edit" (`TestEquipmentEditForm`), in the create flow after the
  device selection and when editing

A stage that should keep "Back" (e.g. when it is the only stage, opened from a list) passes
the label as `children`:

```tsx
<FlowEngineBackButton key={"back"}>{t("buttons.back")}</FlowEngineBackButton>
```

Every other app: nothing to do, but expect "Cancel" instead of "Back" in screenshots.
