# PopupMenu item labels wrap instead of being cut off

- **Date:** 2026-11-12
- **Kind:** behavior
- **Scope:** `standalone/PopupMenu`

## What changed

- A `PopupMenu` item whose label doesn't fit wraps onto more lines inside the menu. Before,
  it stayed on one line (MUI's `MenuItem` sets `white-space: nowrap`), and the paper cut off
  the rest without an ellipsis.
- The paper is `width: max-content`: as wide as its widest item, up to MUI's `max-width` of
  the window's width minus 32px, wherever it opened before. A menu that fits on the screen
  looks exactly as before.

In the library this reaches the four DataGrid menus (header actions, reset, export, and the
footer's "more" menu on phones). On a 320px wide screen with 16px menu text, the French reset
menu's "Réinitialiser les paramètres de la colonne" and "Réinitialiser les largeurs de
colonne" and the Italian "Reimposta impostazioni di ordinamento" now take two lines, as do
long labels of an app's custom data actions.

## Why

At 320px wide (a small phone, or a desktop browser zoomed to 400%) the paper is 288px wide,
and labels longer than that could not be read in full (WCAG 1.4.10 Reflow). The paper's width
no longer depends on its previous position, because a menu kept mounted (as every DataGrid
menu is) would otherwise reopen as narrow as the room right of where it sat before, after the
window got narrower or its labels longer.

## Migration

Nothing to do. Expect two-line items in screenshots of DataGrid menus on phones. A theme that
wants the labels on one line again sets `"& .MuiMenuItem-root": { whiteSpace: "nowrap" }` in
`components.CcPopupMenu.styleOverrides.root`. A single menu that needs a fixed width passes it
in `slotProps.paper.style`.
