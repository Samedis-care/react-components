# RoutedTabs' panels are tab panels, named and controlled by their tabs

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `non-standalone/RoutedTabs` (`RoutedTabs`, `RoutedTabPanelWrapper`)

## What changed

- **The panel is a tabpanel:** `RoutedTabPanelWrapper` wraps the matched panel in a `div`
  with `role="tabpanel"`, an `id` and `aria-labelledby` naming the tab that opens it.
  While nothing inside the panel is focusable (no link, button, form control, element with
  a `tabindex` other than -1, …) the `div` carries `tabindex="0"`, so it is a tab stop and
  Tab from the selected tab reaches the panel; with a focusable control in it the panel is
  no tab stop and Tab goes straight to that control.
- **The tabs name and control their panels:** `RoutedTabs` gives every `Tab` an `id` and an
  `aria-controls` pointing at its panel. Both are derived from the enclosing Route's url
  and the Tab's `value`, so the bar and the wrapper agree without sharing state. A `Tab`
  that sets `id` or `aria-controls` itself has them replaced.
- **An extra element in the DOM:** the panel content is one `div` deeper than before. The
  `div` has no styles of its own (no padding, no paper).
- **The enclosing Route is required:** outside any Route the wrapper now throws
  `RouteContext missing`, as `RoutedTabs` already did; it used to render the matched panel
  there.

## Why

Without the tabpanel role and the `id`/`aria-controls` pair, a screen reader reported a
tab as selected but the content below was an unnamed box with no relation to the tab, and
a panel with text only could not be reached with Tab at all. This is the WAI-ARIA APG tabs
pattern (WCAG 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value).

## Migration

- **Usually nothing to do.** Apps that had added the `id` on each `Tab` and a
  `role="tabpanel"` `div` around each panel by hand can remove both; keeping the hand-made
  wrapper gives two nested tabpanels, and a hand-written `id` on a `Tab` is replaced.
- **Render the wrapper with the bar.** A Tab's `aria-controls` names the panel that
  `RoutedTabPanelWrapper` renders. A bar rendered without the wrapper (no panels at all)
  references an element that does not exist; axe reports that on the selected tab.
- **CSS that selects direct children of the element around a panel** (`.page > .panel`,
  a flex or grid parent whose items were the panel's children) needs one level adjusted,
  because of the added `div`.
- **Two bars under one Route** (not the nested case, where each bar's Route url differs)
  would produce the same ids for the same values. Give them different routes of their own.
