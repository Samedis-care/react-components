# MultiSelectWithTags keeps focus in the group field while a group loads

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Selector` (`MultiSelectWithTags`, and through it
  `BackendMultiSelectWithTags` and `CrudMultiSelectWithGroups`)

## What changed

- While a picked group's entries load (`loadGroupEntries`), the group field is no longer
  `disabled`. It is read-only instead: it keeps focus, nothing can be typed, and no key
  opens its list or picks from it. It looks like an enabled field under the loading
  overlay.
- The root element has `aria-busy="true"` while the entries load, `"false"` otherwise.
- After a group pick with the keyboard or the mouse, focus goes back to the group field,
  and stays there when the field is reloaded after the load. After a pick by touch focus
  is left as it is, so the on-screen keyboard stays closed. Focus the user moved to
  another element during the load stays there.

## Why

The pick blurs the group field, the field was disabled during the load and replaced
after it, so focus fell to the page: a keyboard user had to tab back from the top of the
page after every group pick. Nothing exposed the load to assistive technology.

## Migration

Nothing to do for SCF and IMF. A test that checks the group field with `toBeDisabled()`
during a group load has to check `aria-busy` on the root or the input's `readonly`
attribute instead.
