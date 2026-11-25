# TreeView is exposed as a tree: levels, positions among siblings and expanded state

- **Date:** 2026-11-20
- **Kind:** behavior, type
- **Scope:** `standalone/Tree` (`TreeView`, `TreeViewCheckboxSelectionRenderer`, `TreeDataForRenderer`, `TreeViewProps.renderer`)

## What changed

TreeView's list element has `role="tree"` instead of `list`, and the element TreeView wraps
around each row has `role="treeitem"` instead of `listitem`, with:

- `aria-level`: the entry's `depth` + 1, so a root is level 1.
- `aria-posinset` and `aria-setsize`: the entry's position among its siblings (the children
  of its parent, or the roots) and their number. Before, both counted all visible rows, so
  the first child of a root was "2 of 4".
- `aria-expanded`: the entry's `expanded` flag, on entries with `hasChildren` only.

A treeitem takes its accessible name from the content the renderer draws.

With `TreeViewCheckboxSelectionRenderer`, the tree also has `aria-multiselectable="true"`, and
every leaf's treeitem has `aria-checked` with the leaf's `expanded` flag (the state its
checkbox shows). Entries with `hasChildren` get no `aria-checked`.

Types:

- `TreeDataForRenderer`, and so `TreeViewRendererProps`, has two new required fields:
  `siblingIndex` (the entry's position among its siblings, from 0) and `siblingCount`.
- The `renderer` prop is typed `TreeViewRenderer`: a renderer component with an optional
  static `checkableLeaves`. `TreeViewCheckboxSelectionRenderer` sets it to `true`. Any
  existing renderer component still fits the type.

## Why

Screen readers announced a flat list without levels, without the expanded state of a folder
and with positions counted over all visible rows, so which entries were folders, which were
open and which belonged together was shown only visually (WCAG 1.3.1 Info and
Relationships, 4.1.2 Name, Role, Value). A renderer could not fix this, because its elements
sat inside the `listitem` row element.

## Migration

- **Required for tests and selectors that find TreeView's list or rows by role:** query
  `tree` and `treeitem` instead of `list` and `listitem`, e.g.
  `screen.getAllByRole("treeitem")` or `screen.getByRole("treeitem", { name: "Pumps" })`.
  Note that `aria-setsize` and `aria-posinset` now count siblings, not rows.
- **Required for code that builds `TreeViewRendererProps` or `TreeDataForRenderer` objects
  itself** (e.g. to render a renderer on its own in a test): add `siblingIndex` and
  `siblingCount`.
- Custom renderers: don't give your elements `treeitem`, `group` or `tree` roles; TreeView's
  row element carries the tree semantics. Everything a renderer draws becomes part of the
  treeitem's accessible name, so text that only screen reader users should not hear, such
  as a decorative icon, should be hidden (`aria-hidden`), as MUI icons already are.
- A custom renderer whose leaves are selected with a checkbox that shows the leaf's
  `expanded` flag, as `TreeViewCheckboxSelectionRenderer` does, sets the static:

  ```tsx
  export default Object.assign(React.memo(MyRenderer), {
  	checkableLeaves: true,
  }) satisfies TreeViewRenderer;
  ```

  Other renderers, including ones that use a checkbox to expand or collapse an entry,
  leave it unset.
