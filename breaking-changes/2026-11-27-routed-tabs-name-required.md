# RoutedTabs needs a name: aria-label or aria-labelledby

- **Date:** 2026-11-27
- **Kind:** type
- **Scope:** `non-standalone/RoutedTabs` (`RoutedTabs`, `RoutedTabsProps`, new `RoutedTabsBaseProps` and `RoutedTabsNameProps`)

## What changed

- Every `RoutedTabs` takes `aria-label`, `aria-labelledby`, or both. A bar without either, or
  with only an `aria-label` that may be `undefined`, no longer compiles (TS2322, "Property
  '"aria-labelledby"' is missing"). Both props reach the `role="tablist"` element, as before.
- `RoutedTabsProps` is a type instead of an interface: `RoutedTabsBaseProps` (MUI's
  `TabsProps` without `value` and `onChange`, and without the name) intersected with the union
  `RoutedTabsNameProps`. An interface can no longer extend `RoutedTabsProps`, and a plain
  `Omit<RoutedTabsProps, …>` makes both name props optional again.
- The theme's `CcRoutedTabs.defaultProps` stay optional, as before.

Nothing changes at runtime or visually.

## Why

Both props were optional, so bars went unnamed: screen readers announced "tab list" with
nothing that says what the tabs switch between, when entering the bar and in the list of the
page's widgets (WCAG 1.3.1 Info and Relationships; the WAI-ARIA tabs pattern names every
tablist). No default name fits every bar, so each bar names itself.

## Migration

**Required for any app that renders a `RoutedTabs` without `aria-label` or `aria-labelledby`:**
the app no longer compiles until each bar is named. Where a visible heading above the bar says
what the tabs belong to, such as a record's title, pass that heading's id as `aria-labelledby`.
Otherwise pass a translated `aria-label` that says what the tabs switch between (e.g. "User
details"), with the new key in every locale of the app.

```tsx
<RoutedTabs aria-label={t("form.tabs.label")}>
	<Tab value="" label={t("form.tabs.main")} />
	<Tab value="roles" label={t("form.tabs.roles")} />
</RoutedTabs>

// or, named by a visible heading
const headingId = useId();
<Typography variant="h1" id={headingId}>{title}</Typography>
<RoutedTabs aria-labelledby={headingId}>…</RoutedTabs>
```

**Required for any app that derives its own props from `RoutedTabsProps`:** an
`interface … extends RoutedTabsProps` no longer compiles (TS2312). Extend `RoutedTabsBaseProps`
and intersect with `RoutedTabsNameProps`, or derive with `DistributiveOmit` (exported from the
package root) instead of `Omit`, which keeps the name required:

```ts
interface MyTabsOwnProps extends RoutedTabsBaseProps {
	highlighted?: string;
}
type MyTabsProps = MyTabsOwnProps & RoutedTabsNameProps;

// or
type MyTabsProps = DistributiveOmit<RoutedTabsProps, "linkTabsToPanels">;
```
