# RoutedTabs' panels are tab panels, named and controlled by their tabs

- **Date:** 2026-11-20
- **Kind:** behavior, theme
- **Scope:** `non-standalone/RoutedTabs` (`RoutedTabs`, `RoutedTabPanelWrapper`)

## What changed

- **The panel is a tabpanel:** `RoutedTabPanelWrapper` wraps the matched panel in an element
  with `role="tabpanel"`, an `id` and `aria-labelledby` naming the tab that opens it.
  While nothing inside the panel is focusable (no link, button, form control, element with
  a `tabindex` of 0 or more, …) the element carries `tabindex="0"`, so it is a tab stop and
  Tab from the selected tab reaches the panel; with a focusable control in it the panel is
  no tab stop and Tab goes straight to that control. The content is watched while the
  wrapper is mounted, so a control that appears or goes away after mount (an async load, a
  state change inside the panel) updates the tab stop. While the panel itself has focus it
  stays a tab stop, so focus is not dropped to the body when a control appears under it.
- **The tabs name and control their panels:** `RoutedTabs` gives every `Tab` an `id` and an
  `aria-controls` pointing at its panel. Both are derived from the enclosing Route's url
  and the Tab's `value`, so the bar and the wrapper agree without sharing state. A `Tab`
  that sets `id` or `aria-controls` itself has them replaced.
- **A bar without panels can opt out:** `RoutedTabs` has a `linkTabsToPanels` prop
  (`true` by default). With `false` the Tabs get neither an `id` nor an `aria-controls`.
- **The ids are encoded:** each part is `encodeURIComponent`-encoded and the parts are
  joined with `:`, so different (url, value) pairs never produce the same id. The ids
  contain `%` and `:`; select them with `document.getElementById` or `CSS.escape`.
  `getTabId(url, value)` and `getTabPanelId(url, value)` are exported from the package root
  for a panel that does not come from the wrapper.
- **An extra element in the DOM:** the panel content is one element deeper than before. That
  element is a styled component named `CcRoutedTabPanelWrapper` with a `root` slot and a
  `className` prop. It has no styles of its own (no padding, no paper).
- **The enclosing Route is required:** outside any Route the wrapper now throws
  `RouteContext missing`, as `RoutedTabs` already did; it used to render the matched panel
  there.

## Why

Without the tabpanel role and the `id`/`aria-controls` pair, a screen reader reported a
tab as selected but the content below was an unnamed box with no relation to the tab, and
a panel with text only could not be reached with Tab at all. This is the WAI-ARIA APG tabs
pattern (WCAG 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value).

## Migration

**Required for an app that put its own `id` on a `Tab` or its own `role="tabpanel"`
element around a panel.** RoutedTabs replaces a Tab's `id` and `aria-controls`, and the
wrapper adds the tabpanel element itself, so a hand-made panel points at an id that no
element carries any more and sits around a second, nested tabpanel. Remove the `id` from
each `Tab` and remove your `role="tabpanel"` element; render the panels through
`RoutedTabPanelWrapper` under the same Route (see the next step). A selector that used the
old id, typically an e2e selector, must change too: `getTabId(url, value)` returns the id
RoutedTabs sets now.

```tsx
// before
<Tab label="Security" value="security" id="security-tab" />
<div role="tabpanel" aria-labelledby="security-tab">
	<SecurityPanel />
</div>

// after
<Tab label="Security" value="security" />
<RoutedTabPanelWrapper>
	{[tab("security", <SecurityPanel />), tab("", <GeneralPanel />)]}
</RoutedTabPanelWrapper>
```

**Required for an app that renders `RoutedTabs` without `RoutedTabPanelWrapper`.** Each
Tab's `aria-controls` names the panel that the wrapper renders. Without the wrapper it
points at an element that does not exist; axe reports `aria-valid-attr-value` on the
selected tab and a screen reader gets no relation between tab and content. Render the
bar's panels through `RoutedTabPanelWrapper` under the same Route as the bar:

```tsx
// before: the bar, with its panels from Routes of its own
<RoutedTabs aria-label={t("tabs.label")}>
	<Tab label={t("general")} value="" />
	<Tab label={t("security")} value="security" />
</RoutedTabs>

// after
<RoutedTabs aria-label={t("tabs.label")}>
	<Tab label={t("general")} value="" />
	<Tab label={t("security")} value="security" />
</RoutedTabs>
<RoutedTabPanelWrapper>
	{[tab("security", <SecurityPanel />), tab("", <GeneralPanel />)]}
</RoutedTabPanelWrapper>
```

**Required for an app whose panels cannot go through the wrapper** (the app renders them
itself, or the bar only navigates). Either give your panel element the ids RoutedTabs
expects, with the exported helpers, or turn the wiring off on a bar that has no panels:

```tsx
// your own panel: keep the bar's default and give the panel the id it controls
<div
	id={getTabPanelId(url, value)}
	aria-labelledby={getTabId(url, value)}
	role="tabpanel"
>
	…
</div>

// navigation-only bar: no panel, so no reference to a missing element
<RoutedTabs aria-label={t("tabs.label")} linkTabsToPanels={false}>
	…
</RoutedTabs>
```

**Required for an app whose CSS selects direct children of the element around a panel**
(`.page > .panel`, a flex or grid parent whose items were the panel's children, a
`height: 100%` chain): the panel content is one element deeper. Style that element through
the theme's `CcRoutedTabPanelWrapper` root slot (or its `className`) and make it the flex
or grid item:

```ts
createTheme({
	components: {
		CcRoutedTabPanelWrapper: {
			styleOverrides: {
				root: {
					display: "flex",
					flexDirection: "column",
					flex: 1,
					minHeight: 0,
				},
			},
		},
	},
});
```

**Required for an app that renders two bars under one Route** (not the nested case, where
each bar's Route url differs): both bars derive their ids from that Route's url and the
values, so the same values give the same ids twice (duplicate ids, and every tab controls
the first panel). Give each bar a Route of its own:

```tsx
<Route path="/settings/*" element={<SettingsTabs />} />
<Route path="/account/*" element={<AccountTabs />} />
```
