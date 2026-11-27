# TreeView is one tab stop, and its rows are expanded, collapsed, selected and activated with the keys of a tree

- **Date:** 2026-11-27
- **Kind:** behavior, type
- **Scope:** `standalone/Tree` (`TreeView`, `TreeViewCheckboxSelectionRenderer`, `TreeData.onClick`, `TreeViewContextType`)

## What changed

- The row element TreeView wraps around each row (the `treeitem`) is focusable, and the
  tree is one tab stop (a roving tabindex): only the active row has `tabindex="0"`, the
  others `tabindex="-1"`. The active row is the row focused last (with the keys, a click,
  or focus on a control in the row), at first the first row. Before, nothing in the rows
  of the default renderer was focusable; in Chromium the list's scroll container was the
  tab stop.
- While the active row is scrolled out of the rendered range, the list element
  (`role="tree"`) is the tab stop (`tabindex="0"`, otherwise `"-1"`), and Tab or
  Shift+Tab into it scrolls the active row into view and focuses it. An empty tree has no
  tab stop.
- The keys of the WAI-ARIA tree pattern work on a focused row:
  - ArrowDown and ArrowUp move focus to the next and the previous row, PageDown and PageUp
    by the rows in view, Home and End to the first and the last row, without wrapping. The
    list scrolls the focused row into view, also when it was not rendered yet. These keys
    no longer scroll the list natively, and neither does Space.
  - ArrowRight expands a collapsed entry with `hasChildren` (calling `onLoadChildren`
    first where its children are not in `data`, as a click does), and moves from an
    expanded entry to its first child. ArrowLeft collapses an expanded entry, and moves
    from any other entry to its parent.
  - Enter activates the entry (see below).
  - Space selects or deselects a leaf of a renderer with `checkableLeaves`, such as
    `TreeViewCheckboxSelectionRenderer`.
  - None of them expands, collapses or selects an entry with `expandLocked`. Expanding,
    collapsing, selecting and deselecting call `onToggleExpanded`, as clicks do.
- Enter calls the entry's `onClick` with a click event that TreeView dispatches on the row
  element. The event's `currentTarget` is that element, which now carries the entry's id
  in `data-id`; its `detail` is 0, and its `ctrlKey`, `shiftKey` and `metaKey` are those
  of the key press. Without an `onClick`, Enter expands or collapses an entry with
  `hasChildren`, or selects or deselects a leaf of a renderer with `checkableLeaves`. A
  click without a pointer (`detail` 0) on the row element itself, as assistive technology
  sends it, does the same. Mouse clicks are handled by the renderer, as before.
- While a control inside a row has focus, the arrow, Home, End and page keys still move
  between the rows, unless the control uses them itself (text fields, selects, sliders,
  radio buttons, comboboxes and the like) or prevented the event's default. Enter and Space
  are left to the control.
- The focused row shows a 2px focus ring in the theme's primary color, inside the row.
- `TreeViewCheckboxSelectionRenderer`'s checkboxes are no longer tab stops
  (`tabIndex={-1}`): the row is, and Space on it selects or deselects the leaf. A click on
  a checkbox still toggles it.
- Types: `TreeViewContextType`, the row props TreeView hands to react-window, has two new
  fields, `activeIndex` and `registerRow`.

## Why

Nothing in the built-in renderers could be expanded, collapsed or activated with the
keyboard: the default renderer's rows held nothing focusable, and with the checkbox
renderer no folder could be expanded, so the leaves under a collapsed folder could never be
reached or selected (WCAG 2.1.1 Keyboard, 4.1.2 Name, Role, Value). A tree that scrolled
was a scroll container without keyboard access in browsers that don't focus scroll
containers. A custom renderer could not add the tree's keyboard model, because the row
elements and the visible rows are TreeView's.

## Migration

- **Required for any app whose entry `onClick` reads anything from `event.currentTarget`
  other than its `data-id`:** on Enter, `currentTarget` is TreeView's row element, not the
  element your renderer attached `onClick` to. Close over the entry when you build `data`
  instead, e.g. `onClick: () => select(entry.id)`. An `onClick` that reads the entry from
  `event.currentTarget.getAttribute("data-id")` keeps working: the row element carries the
  entry's id there.
- **Required for any app whose custom renderer has focusable controls of its own** (for
  example an expand `IconButton`): give them `tabIndex={-1}`, so that the tree stays one
  tab stop. Otherwise Tab stops on every rendered row's control before it leaves the tree.
  The arrow keys and Enter on the row now do what those controls do; keep their
  `aria-label` for pointer and screen reader users.

  ```tsx
  <IconButton tabIndex={-1} aria-label={t("expand")} onClick={handleExpand}>
  ```

- A custom renderer control that handles an arrow, Home, End or page key itself calls
  `event.preventDefault()`, so that TreeView leaves the key alone.
- Tests that tab from checkbox to checkbox in `TreeViewCheckboxSelectionRenderer` press
  ArrowDown and ArrowUp on the rows instead, and Space on a row to select its leaf.
