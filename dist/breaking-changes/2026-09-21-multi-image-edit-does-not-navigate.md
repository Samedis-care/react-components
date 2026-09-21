# MultiImage's edit label no longer navigates

- **Date:** 2026-09-21
- **Kind:** behavior
- **Scope:** `standalone/FileUpload/MultiImage`, and everything built on it
  (`CrudMultiImage`, every form that renders an image upload)

## What changed

Clicking the **Edit** label of a `MultiImage` opens the edit dialog and nothing
else. It used to open the dialog *and* follow the anchor's `href="#"`, so the
click also performed a real fragment navigation.

Two consequences of that navigation are gone:

- The URL no longer picks up a trailing `#`.
- The click no longer pushes a history entry, so the browser's back button after
  an Edit click goes where it went before the click, instead of first undoing the
  `#`.

The markup is unchanged — the label is still an `<a>` rendered through MUI's
`Link`, still focusable, still styled as a link. Only the default action is
cancelled.

## Why

The fragment navigation pushed a history entry whose `history.state` is `null`.
`history@5` keys its own entries off an `idx` it stores in that state, so a
stateless entry makes its popstate handler take the "location that was not created
by the history library" branch, where it neither runs the registered blockers nor
applies the transition.

That killed every navigation guard on the page for the rest of its life, silently:

- `DialogContextProvider`'s `navBlock` — in-app back/forward with a dialog open was
  swallowed instead of showing `framework.dialogs.navblock`.
- `BasicFormPage`'s dirty guard — in-app back/forward with a dirty form was
  swallowed instead of showing `backend-components.form.back-on-dirty`.

Both are built on `FrameworkHistory.block`, and both went dead as soon as a user
clicked Edit once. Found while investigating
[samedis-care-issues#2983](https://github.com/Samedis-care/samedis-care-issues/issues/2983).

## Migration

Nothing to do for the normal case — the dialog opens as it always did, and the
guards now fire as they were meant to.

Review call sites only if they relied on the side effect: a consumer that watched
for the `#` in the URL, or that counted history entries after an Edit click, sees
one fewer entry. Consumers that wrapped the control to work around dead navigation
guards can drop the workaround.
