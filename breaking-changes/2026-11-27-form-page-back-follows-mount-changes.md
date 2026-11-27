# A form page's Back asks about a change a control made when it mounted

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `backend-components/Form/BasicFormPage`, and the pages built on it
  (`DefaultFormPage`, `EditOnlyFormPage`, `FlowEngineFormPage`, every CRUD record page)

## What changed

The footer's `customProps.goBack` (the form page's Back) asks "Leave form page?" when the
form holds unsaved changes as the form engine sees them at the call. It used to follow the
form's "dirty" event only from the moment the form page's own effects ran, so it missed a
change announced earlier by a control in the page, in that control's mount effect:

| The form page mounts, and a control's mount effect …          | Before                 | Now                        |
| ------------------------------------------------------------- | ---------------------- | -------------------------- |
| makes the form dirty (`setCustomFieldDirty(name, true)`)      | Back leaves, no prompt | Back asks                  |
| makes a dirty form clean (`setCustomFieldDirty(name, false)`) | Back asks              | Back leaves without asking |

The second case happens when a form page mounts again on a dirty Form, e.g. in a routed
tab panel. A navigation, closing the browser tab and closing a `FullFormDialog` already
followed the form's state in both cases, so Back now agrees with them.

## Why

Save was enabled and leaving through a link asked, but Back left without asking and the
change was lost.

## Migration

Nothing to do. Expect the prompt on Back where a control marks the form dirty when it
mounts, e.g. for data it restores.
