# TreeView takes a name, an id, a className and sx for the tree, and hands no other props to its rows

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/Tree` (`TreeView`)

## What changed

- New `TreeView` props, set on the list element (`role="tree"`): `aria-label`,
  `aria-labelledby`, `aria-describedby`, `id`, `className` and `sx`. The list element is
  the scroll container that holds the rows.
- `TreeView` no longer hands props it does not declare to the row renderer. Before, every
  prop besides `data`, `renderer`, `rendererItemHeight`, `onLoadChildren` and
  `onToggleExpanded` (passed untyped, through a spread or a cast) reached the renderer of
  every row, and none reached the list element. Now such props are ignored: a renderer gets
  its entry's fields and `onToggleExpanded`.

## Why

The tree had no accessible name, so screen readers announced an unnamed tree, and a name
given to `TreeView` anyway went to every row instead of the tree (WCAG 4.1.2 Name, Role,
Value). A `className`, `data-*` attribute or other prop given to it did not reach the tree
either.

## Migration

- **Required for any app that renders a `TreeView`:** give it a name. Where a visible
  heading or label names the tree, pass that element's id as `aria-labelledby`; otherwise
  pass a translated `aria-label`.

  ```tsx
  <h2 id={headingId}>{t("catalog.title")}</h2>
  <TreeView aria-labelledby={headingId} data={data} … />
  // or
  <TreeView aria-label={t("catalog.tree")} data={data} … />
  ```

- **Required for any app that passes extra props to `TreeView` for its renderer to read:**
  they no longer arrive. Provide them through a React context around the tree and read it
  in the renderer.

  ```tsx
  const RowExtrasContext = React.createContext<RowExtras | null>(null);

  <RowExtrasContext.Provider value={extras}>
  	<TreeView renderer={MyRenderer} … />
  </RowExtrasContext.Provider>;

  // in MyRenderer
  const extras = useContext(RowExtrasContext);
  ```
