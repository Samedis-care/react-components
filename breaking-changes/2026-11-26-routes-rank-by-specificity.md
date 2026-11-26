# Routes renders the most specific matching route, `""` and `"/"` match only the parent's url, and Route takes `end`

- **Date:** 2026-11-26
- **Kind:** behavior, type
- **Scope:** `standalone/Routes` `Routes`, `Route`, `RouteProps`, `RouteContextType.rendersAt`; `non-standalone/RoutedTabs` `RoutedTabPanelWrapper`

## What changed

- `Routes` renders the most specific of its children whose path matches the location,
  whatever their order: the path with more segments, then, segment by segment from the
  left, a literal before a `:name` param before a `*`, then a path without a trailing `/*`
  before the same path with one. On a tie the child listed first is rendered. Before, the
  first matching child in the order of the children was rendered, so `/devices/*` listed
  before `/devices/new/*` showed the list at `/devices/new`. `RoutedTabPanelWrapper` shows
  its panel by the same order, so the default tab's entry no longer has to come last, and a
  Route's `rendersAt` answers by it. `RoutedMenu` highlights its entries by the same order,
  as before.
- A Route whose path has no segments, `""` or `"/"`, matches only the url of the Route
  around it, at every level, as `"/"` matches only `/` at the top level. Before, a nested
  `""` or `"/"` matched every location below its parent. The catch-all below a parent is
  `*`.
- `Route` takes `end`: with it, its path has to match the whole location (`"/devices"`
  matches `/devices` but not `/devices/1`). The Route itself, the Routes it is a child of
  and `rendersAt` all honour it. Routes matches a child by its `path` and `end` only;
  before, it also read other props of a child element, such as `caseSensitive`, into the
  pattern.
- In development (`process.env.NODE_ENV` is `"development"`), a `Routes` outside of every
  Route that matches nothing logs a `console.warn` that names the location, once per path.
  A nested Routes stays silent.

## Why

Routes picks its route the way react-router does, so the order of a route list no longer
decides which page is shown and a list can be kept in any order. A path without segments
stands for the parent's own page at every level and `*` for everything else, so an index
route and a not-found route can sit side by side below a parent.

## Migration

Nothing to do for a route list whose more specific paths come before the general ones, the
order Routes needed so far: it renders the same pages. A list that is sorted or reversed
only to put the specific paths first can drop that step.

**Required for any app that has a nested Route with the path `""` or `"/"` meant to catch
the locations below its parent**, e.g. an overview shown for every unknown sub-path: it now
renders only at the parent's own url, and below it nothing is rendered. Give it the path
`*`, or add a `*` route next to it:

```tsx
<Route
	path="/devices/:id/*"
	element={
		<Routes>
			<Route path="history" element={<History />} />
			<Route path="*" element={<Overview />} />
		</Routes>
	}
/>
```

**Required for any app that lists a general path before a more specific one that matches
the same locations and wants the general one shown there**, e.g. `/devices/*` before
`/devices/new/*`: the more specific route is rendered there now. Remove the more specific
route, or narrow it (e.g. with `end`) so that it no longer matches where the general one is
to be shown.

A child of Routes that is a wrapper element passing `caseSensitive` to its Route is matched
case-insensitively by Routes now, as the Route itself always did.
