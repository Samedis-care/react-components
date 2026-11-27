# RoutedTabs reads the URL's segment as its panels do, so the Tab whose panel is shown is selected

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `non-standalone/RoutedTabs`

## What changed

`RoutedTabs` selects the Tab whose `value` is the first path segment after the enclosing
Route's url. It now reads that segment the way the panels of `RoutedTabPanelWrapper` (Routes)
read it, so the selected Tab is the one whose panel is shown:

- A segment in other letter case: `/settings/Security` selects the Tab `"security"`.
- A percent-encoded segment, as a browser history keeps a value with a space or a non-ASCII
  letter: `/settings/my%20tab` selects the Tab `"my tab"`.
- A "//" in the URL, e.g. a hand-built `//settings/security`, counts as one "/" and selects
  the Tab `"security"`.
- A Tab without `value`, which MUI gives its index, is selected at the URL a click on it
  opens (`/settings/1`).

Before, the segment was compared as it is, case-sensitive and still encoded, and a "//"
before it shifted it: at these URLs the panel showed while the default tab, or no tab, was
selected.

In development, the bar now logs a warning (`console.warn`, once per bar and Tab) for a Tab
whose value is not one path segment:

- a value with "/" (`"a/b"`): its Tab is never selected, since its panel spans more than one
  segment;
- a value that is not a string, such as the index MUI gives a Tab without `value`.

## Why

The bar and its panels disagreed at these URLs: a panel was shown under another tab, or
under none, and assistive technology announced that other tab as the selected one.

## Migration

Nothing to do for Tabs whose values are strings without "/" and whose panels have the same
name (`<Tab value="security" />` with `tab("security", …)`).

Required for any app with a Tab that the new warning names, i.e. a Tab without `value` or
with a value that has a "/" or is not a string: without it, the wrong Tab or none is selected
while its panel shows. Give the Tab a value of one path segment and its panel the same name;
for a deeper level, put a nested `RoutedTabs` with its own panels into the panel:

```tsx
const tab = useRoutedTabPanel();
<RoutedTabs aria-label={t("tabs.label")}>
	<Tab value="" label={t("tabs.general")} />
	<Tab value="history" label={t("tabs.history")} />
</RoutedTabs>
<RoutedTabPanelWrapper>
	{[tab("history", <HistoryTabs />), tab("", <General />)]}
</RoutedTabPanelWrapper>
```
