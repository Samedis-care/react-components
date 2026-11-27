# A create form left while it saves no longer pulls the user back to the saved record

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `backend-components/CRUD`

## What changed

After the first save of a new record, CRUD moves the create form on to the saved record:
routed, it replaces `<url>/new…` with `<url>/<id>…`; with `disableRouting`, the "new" view
becomes the saved id. It decided this from where the user was when the save started, so a
user who left the create form while the save ran was pulled back to the saved record when it
finished.

Now CRUD decides it from where the user is when the save finishes, and moves on only while
the create form is still shown:

| While the create form saves, the user …                | Before                                                            | Now                            |
| ------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------ |
| goes to another page (routed)                          | is taken to `<url>/<id>`, which replaces that page in the history | stays on that page             |
| goes back to the list or opens another record (routed) | is taken to `<url>/<id>`                                          | stays where they went          |
| opens another record (`disableRouting`)                | sees the saved record instead                                     | stays on that record           |
| opens a tab of the create form (routed)                | is taken to `<url>/<id>`, without the tab                         | is taken to `<url>/<id>/<tab>` |

A view closed during the save (`disableRouting`) stays closed, as before. In every case the
grid is still reloaded and `formProps.onSubmit` is still called with the saved record.

## Why

Leaving the create form while it saves is the user's choice: a routed navigation away from
it asks "Leave form page?" first. The finished save undid that choice and, routed, removed
the page the user went to from the history, so Back no longer returned to it.

## Migration

Nothing to do.
