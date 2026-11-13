# A form page's leave guard lasts as long as its Form

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `backend-components/Form/Form` and `BasicFormPage`, and the pages built on it
  (`DefaultFormPage`, `EditOnlyFormPage`, `FlowEngineFormPage`, every CRUD record page)

## What changed

The leave guard of a dirty form page ("Leave form page?" before a navigation, the
browser's prompt when the tab is closed, the prompt when a `FullFormDialog` is closed)
belongs to the `Form` now. The first form page that mounts in a Form switches it on, and
from then on it guards the Form's unsaved changes until the Form unmounts, also while no
form page is mounted. It used to end when the form page unmounted, while the Form kept the
changes.

A form page in a `RoutedTabs` panel, with the tabs outside of it, is the case where the two
differ:

| The Form is dirty, another tab is open                  | Before                     | Now                     |
| ------------------------------------------------------- | -------------------------- | ----------------------- |
| A link, a menu entry or browser Back away from the Form | leaves, the edits are lost | asks "Leave form page?" |
| Closing or reloading the browser tab                    | leaves, the edits are lost | the browser asks        |

Whether a navigation stays inside the form page, and so passes without asking, follows the
Form's nearest Route now, no longer the form page's. They differ only when a Route lies
between the two, as with a form page in a tab panel: opening another tab of the same Form
passes without asking (the Form keeps the edits), where a form page in the panel of a tab
other than the default one used to ask.

## Why

The unsaved changes are the Form's. A form page in a tab panel unmounts when another tab
is opened, but the Form above it keeps the edits; the guard went with the page, so leaving
the Form from there lost the edits without a prompt.

## Migration

Nothing to do. Expect the prompt when the user leaves a dirty Form whose form page is not
shown at the moment, e.g. IMF's profile after switching from "Account" to another tab.
An app that hides a dirty form page to discard its changes resets the form (`reset`) so
that leaving does not ask.
