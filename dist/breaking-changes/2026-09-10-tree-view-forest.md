# TreeView renders a forest, and hands renderers its connector lanes

- **Date:** 2026-09-10
- **Kind:** behavior, type
- **Scope:** `standalone/Tree`

## What changed

### `data` may hold several roots

`TreeViewProps.data` used to be one root node: flat input kept the **first** entry with
`parentId === null` and silently dropped every other one, and nested input was a single
object by construction. It is now `TreeData | TreeData[] | TreeDataFlat[]`:

- Flat input: **every** entry with `parentId === null` is a root. Roots render in input
  order, as do the children of a node, so the caller controls the display order.
- Nested input: an array of roots is accepted as well. An array must not mix the two
  forms — one with both nested and flat entries throws, instead of guessing. The
  discriminator is the `parentId` property, which `TreeDataFlat` requires and `TreeData`
  does not have.
- `data: []` renders an empty tree. A **non-empty** flat array without any root still
  throws `No root node found`, because that is a caller bug rather than a forest.

Two robustness fixes came along: entries whose `parentId` names an id that is not in
`data` are still dropped (they are unreachable from any root), and an entry that is its
own ancestor — reachable only through a duplicated id — no longer recurses forever. Both
log a `console.warn` in development builds.

### `parentHasNext` is now `ancestorLanes`, joined by `hasConnector`

`TreeDataForRenderer.parentHasNext` is gone. Two props replace it:

- `ancestorLanes: boolean[]` — the vertical lanes to draw in front of the entry,
  outermost first, one lane cell per element. `true` draws the line, `false` leaves the
  lane blank and only reserves the indent.
- `hasConnector: boolean` — whether to draw the connector (the elbow that joins this row
  to its siblings' spine) after those lanes.

`parentHasNext` was the raw `hasNext` flag of every ancestor, indexed by depth, and it was
up to the renderer to work out which of those entries are actually lanes — both in-tree
renderers did that with a `.slice(1)`. `ancestorLanes` is the answer instead of the input:
what TreeView hands over is exactly what gets drawn.

That is also what makes the forest work. A set of siblings shares one vertical spine, and
that spine sits one lane in front of the siblings themselves — the lane the connector
draws. A lone root has no siblings and therefore no spine, so nothing is drawn in front of
it. The roots of a forest _are_ siblings of each other, so they get a spine of their own:
`hasConnector` is true for them, and everything below them shifts by that one lane.

## Why

The device system view in samedis-ui shows an inventory as a tree of arbitrary depth, and
the backend's `DeviceTree` explicitly supports several parallel roots — devices that
belong together without one being subordinate to the others. `DeviceTree#as_forest`
returns `roots: [...]`, and the write API has a `peer_inventory_id` param whose only
purpose is "attach as another root alongside this device". A two-root system rendered as
one subtree with the rest silently missing.

The lane change is the part a forest cannot do without. With `parentHasNext`, the root's
entry was dropped by every renderer, which was harmless only because a lone root can never
have a following sibling. In a forest it is the trunk that has to descend past root A's
whole subtree to reach root B, and that line was simply never drawn.

## Migration

Single root trees render **pixel-identically**, and `TreeViewDefaultRenderer` (which draws
no connectors, only a `depth * 48` indent) is unaffected either way. Only custom renderers
that draw connector lines need adjusting — in samedis-ui that is
`DeviceTypeCatalogTreeRenderer.tsx`, which was modelled on
`TreeViewCheckboxSelectionRenderer` and carries the same `.slice(1)`.

Drop the slice, and gate the connector block on `hasConnector` rather than on `depth`:

```diff
-const { depth, parentHasNext, hasNext, ... } = props;
+const { ancestorLanes, hasConnector, hasNext, ... } = props;

-const offsetLeft = depth > 0 ? 12 : 0;
+const offsetLeft = hasConnector ? 12 : 0;

-{depth !== 0 && (
+{hasConnector && (
   <>
-    {parentHasNext.slice(1).map((pHasNext, idx) => (
+    {ancestorLanes.map((laneHasSpine, idx) => (
       <Grid key={idx}>
-        <div style={{ height: 24, width: 24, borderLeft: pHasNext ? "1px solid black" : undefined }} />
+        <div style={{ height: 24, width: 24, borderLeft: laneHasSpine ? "1px solid black" : undefined }} />
       </Grid>
     ))}
     {/* the connector (elbow) cell is unchanged */}
```

For a single root tree those two expressions evaluate to exactly what the old code
produced. A renderer that only reads `depth`, `hasPrev` or `hasNext` needs no change at
all; `hasPrev` and `hasNext` are simply meaningful at depth 0 now, where they describe the
sibling roots.

Callers passing flat data keep working unchanged. What they get differently is that extra
roots stop disappearing — if any caller relied on passing a list with several
`parentId: null` entries and seeing only the first, it now shows all of them.

One thing to know about a tree that gains and loses roots at runtime: a forest indents by
one lane more than a single root tree, so going from one root to two shifts the tree right
by 24px. The one-root case is kept flush left on purpose, so that existing single root
trees do not gain a permanently blank indent lane.
