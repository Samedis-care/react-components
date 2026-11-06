# A field's message describes its control, and selectors show the error state

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`FormField`), `backend-integration/Model` (`RenderParams`,
  the renderers)

## What changed

- `FormField` gives every control an id: its new `id` prop, else one generated for the field.
  The field's error or warning message gets the id `<id>-message` and is the description of
  the control (`aria-describedby`) while it shows. `FormField` also takes `aria-describedby`,
  ids of the page's own text that describe the field; the control references them first, then
  the message.
- Checkboxes, switches, radio groups and groups of checkboxes are marked invalid
  (`aria-invalid`) while their error shows, as text fields and the enum select already were.
  A radio group is exposed as required (`aria-required`) when the field is.
- The enum and backend selectors (single and multi) receive the field's `error` and
  `warning`: their combobox is marked invalid, and their label and outline turn red on an
  error and their outline amber on a warning, as a text field's do. Until now only the
  message under them was coloured. The selector's message is not its description yet.
- `RenderParams` has `id`, `messageId` and `describedBy`, optional, set by `FormField` and
  undefined where there is no form behind the control (data grid cells, the import preview).
- The enum and backend selector renderers' options no longer set `autocompleteId`: the field's id
  replaces it.
- An `aria-describedby` in a text field renderer's `slotProps.htmlInput` is kept, and the
  field's description is added after it.

Covered: the text, number, currency and color fields, localized single-language strings,
string lists, checkboxes, switches, radio groups, groups of checkboxes, the enum select and the
enum and backend selectors. Date and time fields, localized strings, file and image uploads, the
signature pad, the tag selector and the data grid multi select are not linked yet.

## Why

A screen reader heard that a text field was invalid but not why, because the message was a
sibling without a link to the field, and heard nothing at all for an invalid checkbox, radio
group or selector. Warnings reached assistive technology only through the submit dialog. An
application could not tie its own instructions to a model field.

## Migration

- Nothing to do in pages: the library's renderers apply it to every `FormField`. Pass
  `aria-describedby` where the page shows instructions for a field, and `id` where the page
  links to a field or labels it itself.
- Custom renderers: destructure `id`, `messageId` and `describedBy`, give `id` and
  `aria-describedby={describedBy}` to the control, render the message in an element with
  `id={messageId}`, and set `aria-invalid` on a control that MUI's `error` does not reach.
  Until they do, their messages stay unlinked. Renderers that delegate by spreading `params`
  into another renderer need no change.
- An app that passes `autocompleteId` in a selector renderer's options: pass `id` to the
  `FormField` instead.
- Screenshots of forms with an invalid selector show its red label and outline now.
