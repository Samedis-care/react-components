# ComponentWithLabel captions wrap when they have too little room

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/UIKit/ComponentWithLabel`, `standalone/DataGrid` (the captions of the
  header and footer buttons)

## What changed

A `labelText` caption wraps at its spaces (and after a hyphen) where it has less room than
its text needs, like the label of MUI's `FormControlLabel`. It used to stay on one line
however little room it had (`white-space: pre`), running past its container. A `"\n"` in
the text still starts a new line. Runs of spaces are collapsed to one, and spaces at the
start or end of a line are dropped.

Where a caption has room, it looks as before. Captions wrap in rows of captioned buttons
that are narrower than their captions, e.g. a custom action of the DataGrid footer on a
phone ("Einweisung dokumentieren" takes two lines): the row gets taller instead of wider.

A box that is only as wide as its content has to be (its min-content width, e.g. a flex
item with `flex-basis: 0%` that has no free space to grow into, or `width: min-content`)
is now as narrow as the longest word of each caption, so every caption in it wraps at
every space.

## Why

A row of captioned actions on a 320px phone was wider than the screen, so the page
scrolled sideways (WCAG 1.4.10 Reflow). Users who widen letter and word spacing
(WCAG 1.4.12) made the captions wider still.

## Migration

Nothing to do where captions have room. Expect two-line captions in crowded rows, also
in screenshots.

**Required for samedis.care's `SamedisMobileBackendDataGrid`**: its row actions
(`ItemRendererInnerActions`, `flexBasis: "0%"` and `flexShrink: 0` inside the row's
horizontal swipe scroller) are as narrow as their captions allow. Without a change, every
caption with a space or hyphen wraps there, and the 60px row cuts off its second line:
"Einweisung dokumentieren" shows as "Einweisung", "QR-Code drucken" as "QR-". Size the
panel by its content, which keeps each caption on one line as before:

```ts
const ItemRendererInnerActions = styled("div")(({ theme }) => ({
	display: "flex",
	flexBasis: "auto", // was "0%"
	flexShrink: 0,
	flexGrow: 1,
	scrollSnapAlign: "start",
	verticalAlign: "top",
	backgroundColor: theme.palette.secondary.light,
}));
```

The same applies to any other box of `ComponentWithLabel`s that is sized to its
min-content width: give it `flex-basis: auto` or `width: max-content`.
