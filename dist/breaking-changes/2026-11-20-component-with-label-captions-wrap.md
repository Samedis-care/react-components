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

**Required for a box of `ComponentWithLabel`s that is sized to its min-content width**,
such as row actions in a horizontal swipe scroller with `flexBasis: "0%"` and
`flexShrink: 0`: the box is as narrow as the captions allow, so every caption with a space
or hyphen now wraps there, and a row of fixed height cuts off the second line ("Print QR
code" shows as "Print"). Size the box by its content (`flex-basis: auto` or
`width: max-content`), which keeps each caption on one line as before:

```ts
const RowActions = styled("div")({
	display: "flex",
	flexBasis: "auto", // was "0%"
	flexShrink: 0,
});
```
