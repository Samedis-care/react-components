# SignaturePad's dialog is part of the field

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `non-standalone/SignaturePad`, and through it the form renderer of
  `TypeSignature`

## What changed

SignaturePad renders its sign dialog from its own React tree while the dialog is open,
instead of pushing it into the DialogContextProvider's list. On screen the dialog is the
same (it is still a MUI Dialog portaled to `document.body`), but:

- The open dialog follows the field's current props: a `signerName` that arrives after it
  opened shows in its title and in the Clear confirmation, a new `signature` value is what
  it shows and what Save keeps, and Save calls the current `setSignature`, not the one of
  the click that opened it.
- It closes, without saving, when the field unmounts (a conditional section, a tab switch)
  and when the field becomes `disabled` while it is open (e.g. the form turns read-only).
  Its Clear confirmation closes with it. Enabling the field again does not reopen it.
- Contexts around the field reach the dialog, e.g. a ThemeProvider around a part of the page
  with `components.CcSignPadDialog.defaultProps` (such as `penColor`). Before, only contexts
  around the DialogContextProvider did.
- React events from inside the dialog (clicks, key presses, focus and blur) bubble through
  the field's ancestors in the React tree, as they do from MUI's own popups (a Select's menu,
  an Autocomplete's list). The DOM is unchanged, so native listeners see nothing new.
- SignaturePad no longer needs a DialogContextProvider (or the Framework) above it.

`SignDialog` itself is unchanged: pushed with `pushDialog`, it still keeps the props it was
pushed with.

## Why

The pushed dialog kept a copy of the props from the click that opened it, so the title said
"Sign Here" when the signer's name was loaded after the click, Save still stored a signature
after the form had turned read-only, and the dialog stayed open with a stale `setSignature`
after its field was gone.

## Migration

Nothing to do for SCF and IMF. A form's signature field reports blurs from inside the dialog
to the field's `handleBlur`, which only marks the field touched again.

**Required for** an app that puts a SignaturePad inside an element whose React handlers
(`onClick`, `onKeyDown`, `onMouseDown`, …) must not react to the dialog: without a change,
a click on Save also reaches that handler. Ignore events whose target is outside the
element in the DOM:

```tsx
const handleRowClick = (event: React.MouseEvent<HTMLElement>) => {
	// a portaled dialog of a field inside the row
	if (!event.currentTarget.contains(event.target as Node)) return;
	openRecord();
};
```
