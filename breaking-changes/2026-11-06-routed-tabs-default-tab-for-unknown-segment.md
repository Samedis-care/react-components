# RoutedTabs selects the default tab when no Tab has the URL's segment

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `non-standalone/RoutedTabs`

## What changed

`RoutedTabs` selects the Tab whose `value` is the first path segment after the enclosing
Route's url. When no Tab had that segment, it still passed the segment to MUI's `Tabs`: no
tab was selected, no indicator was drawn, and MUI logged "The `value` provided to the Tabs
component is invalid".

Now the default tab (`value=""`) is selected in that case. Without a default tab no tab is
selected (`Tabs` gets `false`), and nothing is logged. This applies to:

- a stale or typed link to a tab that does not exist (`/users/1/unknown`),
- a Tab that is not rendered for the current record or user while the URL still names it,
  e.g. a tab removed by a change of the record's type while it was open,
- a path below the default tab's panel, if that panel has routes of its own.

As with every selected tab, a click on the default tab at such a URL does not navigate.

## Why

The panel shown at such a URL is the default one (`tab("", …)` matches every path), so the
tab bar showed no selection and assistive technology reported every tab as not selected
while a panel was on screen.

## Migration

Required for apps that render a Tab conditionally but list its panel unconditionally, such
as samedis-ui's `FacilityDataForm` (the `sync` and `subscription` Tabs are for admins only,
their panels are listed for everyone): at that tab's URL the hidden tab's panel is shown,
and it now shows under the selected default tab. Put the Tab's condition on its panel as
well, so that URL shows the default panel:

```tsx
<RoutedTabPanelWrapper>
	{[
		tab("contacts", <Contacts />),
		...(isAdmin ? [tab("sync", <SyncSettings />)] : []),
		tab("", <General />),
	]}
</RoutedTabPanelWrapper>
```

Nothing else to change.
