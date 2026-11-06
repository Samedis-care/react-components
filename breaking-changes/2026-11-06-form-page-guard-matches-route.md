# A dirty form page asks before leaving for a path that only starts like its own

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `backend-components/Form/BasicFormPage`, and the pages built on it
  (`DefaultFormPage`, `EditOnlyFormPage`, every routed CRUD record page)

## What changed

A navigation away from a dirty form page counts as one inside the page (routed tabs, a
routed stepper), and passes without "Leave form page?", only when the form's nearest
Route still renders at the target with the same url: the url itself or a path below it.

| From the page at | To                                  | Before | Now    |
| ---------------- | ----------------------------------- | ------ | ------ |
| `/devices/1`     | `/devices/1/more`, `/devices/1`     | passes | passes |
| `/devices/1`     | `/devices/12`, `/devices/1-archive` | passes | asks   |
| Route `/`        | any other path                      | passes | asks   |
| Route `/*`       | any path                            | passes | passes |

A Route `/` renders only at `/`, so leaving `/` leaves the page. A Route `/*` renders its
element at every path, so no navigation leaves the page through it: the form stays mounted
with its edits.

## Why

The check was a plain prefix test on the url (`pathname.startsWith(url)`), so a link from
record 1 to record 12 took the user to the other record without asking and the edits of
record 1 were lost, and a form page whose Route url is `/` never asked.

## Migration

Nothing to do. Expect the prompt where an app navigated from a dirty form page to such a
path; a navigation that should leave without asking saves or resets the form first, as
before.
