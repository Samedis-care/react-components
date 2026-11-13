# Saving a new record keeps the tab it was saved on

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `backend-components/CRUD`

## What changed

After the first save of a new record, a routed CRUD replaces the create form's URL with the
saved record's URL. It used to replace all of `<url>/new/…` with `<url>/<id>`, so a record
page with routed tabs (`RoutedTabs`) opened on its default tab, whichever tab the user had
saved on.

Now the path below `new` is kept: `<url>/new/permissions` becomes `<url>/<id>/permissions`,
and the record page stays on the tab it was saved on. The tab's panel and the Form stay
mounted. As before, the history entry of the create form is replaced, not pushed, and the
create form's query string and hash are not carried over. Saving at `<url>/new` still goes to
`<url>/<id>`, and with `disableRouting` nothing changes.

## Why

Saving an existing record leaves the user on the tab they saved on; saving a new one moved
them to the default tab. A tab that asks the user to save first, such as IMF's role form ("Save
before you can assign permissions"), had to be opened again after the save.

## Migration

Nothing to do. A record page that shows its tabs only for saved records, such as
samedis-ui's `TenantContractForm` and `FacilityDataForm`, is saved at `<url>/new`, so it opens
on its default tab as before; only a typed `<url>/new/<tab>` now opens that tab after the save.
