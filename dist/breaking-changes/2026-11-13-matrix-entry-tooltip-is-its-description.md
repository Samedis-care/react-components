# A Matrix entry's tooltip is its accessible description

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Matrix` (`MatrixCellTile`, `MatrixGrid`)

## What changed

An entry's `tooltip` (`MatrixTileItem.tooltip`) is now the entry's accessible description;
its label stays the name:

- A clickable entry (with `onItemClick`) is announced as "F, button, Early shift, Alice
  Weber" instead of "F, button". A diagonal pair is announced with both labels as its
  name and both tooltips, joined with " / ", as its description.
- While the tooltip is closed, the entry carries it as its `title` attribute; while it is
  open, `aria-describedby` points at it (MUI's `Tooltip` with `describeChild`).
- A read-only entry (no `onItemClick`) no longer carries `aria-label` with the tooltip
  text. It gets the same `title` / `aria-describedby` instead.

## Why

The tooltip, usually the only place an entry is spelled out (the shift's name, the person,
the times), never reached assistive technology: a clickable entry was named by its label
alone and had no description, also while the tooltip was open on focus. A read-only entry
got the tooltip as `aria-label` on a div without a role, where `aria-label` is not allowed
and screen readers ignore it (WCAG 1.3.1, 4.1.2).

## Migration

Nothing required. Tests that found a read-only entry by its tooltip as a label
(`getByLabelText("Early shift")`) find it with `getByTitle("Early shift")` now; a clickable
entry is found by its description: `getByRole("button", { description: "Early shift" })`.
