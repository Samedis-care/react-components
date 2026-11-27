# A RoutedTabs panel that suspends shows a loader inside the panel, and the tab bar stays

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `non-standalone/RoutedTabs` (`RoutedTabPanelWrapper`)

## What changed

- **The panel has a Suspense boundary of its own:** `RoutedTabPanelWrapper` renders the
  matched panel inside a Suspense boundary within its tabpanel. A panel that suspends (a
  `React.lazy` component, a `useTranslation` namespace that has not loaded yet, a
  suspending query) now shows a `Loader` inside the panel, below the tab bar. The nearest
  Suspense boundary above the bar (a page's, CRUD's form wrapper's) no longer shows its
  fallback for it, so the bar stays visible and the tab that opened the panel keeps the
  keyboard focus.
- **The panel is busy while it loads:** the tabpanel has `aria-busy="true"` while the
  fallback shows. The default fallback, a `Loader`, is a polite status
  (`role="status"`, `aria-busy="false"`) whose spinner is named "Loading…" in the
  library's language.
- **New prop `fallback`:** what the panel shows while it loads, instead of the `Loader`.
  `null` shows nothing; the panel is still `aria-busy`.
- Panels that do not suspend render exactly as before: the boundary adds no element.

## Why

When a panel suspended, React hid the whole routed page, tab bar included, behind the
fallback of the nearest boundary above it. Keyboard focus was on the activated tab, which
was hidden, so it fell to the page body and stayed there after the panel had loaded, and
nothing announced the load (WCAG 2.4.3 Focus Order, 4.1.3 Status Messages).

## Migration

Nothing to do for panels that do not suspend.

**For an app whose panel suspends** and that relied on the boundary above the tab bar to
show the loading state: the page's fallback no longer appears for it; the panel shows a
`Loader` under the bar instead. To show something else there (a skeleton of the panel),
pass it as `fallback`:

```tsx
<RoutedTabPanelWrapper fallback={<ReportSkeleton />}>
	{[tab("report", <LazyReport />), tab("", <General />)]}
</RoutedTabPanelWrapper>
```

A Suspense boundary inside a panel element keeps catching that panel's content first, as
before.
