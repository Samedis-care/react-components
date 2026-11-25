# Leaving several dirty forms asks once, and "Yes" keeps the forms it did not leave guarded

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `backend-components/Form/Form` and `BasicFormPage` (the leave guard of every form
  page: `DefaultFormPage`, `EditOnlyFormPage`, `FlowEngineFormPage`, every CRUD record page,
  form pages in a `FullFormDialog`), `framework/Framework`

## What changed

The leave guards of all Forms inside a `Framework` block the history together now, also those
of Forms in pushed dialogs. Each guard used to block the history on its own.

| Situation | Before | Now |
| --- | --- | --- |
| Leaving a page with two dirty forms: a record page with the dirty form page of an embedded CRUD, or a dirty `FullFormDialog` over a dirty form page | one "Leave form page?" per form; "Yes" in one and "No" in the other left the first form dirty and unguarded | one "Leave form page?"; "No" keeps both forms guarded |
| A link, Back or `navigate()` while "Leave form page?" is open | another prompt on top | no other prompt; "Yes" goes where the latest navigation led |
| A navigation inside a page with two dirty forms (routed tabs) | could add its history entry twice | adds it once |
| The footer's Back → "Yes", and the Form's `goBack` does not leave the form: it does not navigate, or another dirty form's prompt gets "No" | the form stayed dirty and unguarded | the form stays guarded |

The footer's Back ("Leave form page?" → Yes) lets the navigation through that the Form's
`goBack` starts while it runs, as CRUD's does. When that navigation also leaves another dirty
form, that form asks, as before. A navigation that `goBack` starts later, e.g. after an
`await`, asks "Leave form page?" again.

A `Form` rendered outside of a `Framework` blocks the history on its own, as before.

## Why

Several dirty forms asked once each, and "Yes" in one prompt dropped that form's guard before
the navigation had happened: when another prompt was then answered "No", the user stayed with
unsaved changes that a later navigation left without asking. The same happened when the
footer's Back was confirmed and the navigation did not take place.

## Migration

Nothing required. A Form's `goBack` that navigates after an `await` makes the footer's Back
ask twice: start the navigation synchronously in `goBack`.
