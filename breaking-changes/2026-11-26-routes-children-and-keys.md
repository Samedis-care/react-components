# Routes takes any JSX children, and a key on a child takes effect

- **Date:** 2026-11-26
- **Kind:** behavior, type
- **Scope:** `standalone/Routes` `Routes`, `RoutesProps`; `non-standalone/RoutedTabs` `RoutedTabPanelWrapper`

## What changed

`Routes` takes its routes the way JSX passes children:

- `RoutesProps.children` is `React.ReactNode` instead of `React.ReactElement<RouteProps>[]`.
  A single child works, and `false`, `null` and `undefined` are skipped, so a conditional
  route is `{isAdmin && <Route … />}`. Before, all of these threw.
- The children of a fragment take the fragment's place in the order, so a group of routes
  can be conditional: `{isAdmin && (<>…</>)}`. Before, a fragment was an entry without a
  path and was never rendered. `RoutedTabPanelWrapper` reads its entries the same way.
- A key on a child takes effect. The rendered child is still keyed by its path, so switching
  to another child remounts its element and navigating within the same child keeps it
  mounted. Its own key now counts as well, as on any element: a new key remounts the
  element, e.g. `<Route key={tenantId} path="/t/:tenantId/*" … />`. Two children with the
  same key are still told apart by their paths. Before, Routes replaced every child's key
  with its path, so a key did nothing.

## Why

A Routes child is an element like any other: JSX conditionals and fragments work with it,
and its key does what a key does everywhere in React.

## Migration

Nothing to do for an app whose keys on Routes children stay the same while the route is
shown, such as keys that name the route (`key={entry.route}`, `key="not-found"`).

**Required for any app that gives a Routes child a key that can change while the route
stays shown**, e.g. a key computed from state, or the index of the route in a list that can
change: the route's element now remounts when the key changes and loses its state. Give
each route a fixed key, such as its path:

```tsx
<Routes>
	{routes.map((entry) => (
		<Route key={entry.path} path={entry.path} element={entry.element} />
	))}
</Routes>
```

Code that reads `RoutesProps["children"]` as an array has to handle a `React.ReactNode`.

Conditional routes no longer need array spreads, and JSX children need no keys:

```tsx
<Routes>
	{isAdmin && <Route path="admin/*" element={<Admin />} />}
	<Route path="*" element={<Home />} />
</Routes>
```
