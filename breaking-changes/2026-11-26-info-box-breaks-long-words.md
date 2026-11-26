# InfoBox breaks long words in its heading and message

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/InfoBox`

## What changed

InfoBox's heading (theme name `CcInfoBox`, slot `heading`) and its message panel (slot
`details`, inherited by the message) now set `overflow-wrap: anywhere`. A word wider than the
box, such as a long compound, a file name or a URL, is broken onto the next line inside the
box. It used to run past the box's edge, where the box cut it off, so the rest could be neither
read nor selected. Text without such a word is laid out as before.

The header content (slot `summaryRoot`) and MUI's content wrapper around it have
`min-width: 0`, so they are never wider than the header. Heading content that cannot wrap
(e.g. an element with `white-space: nowrap`) now starts next to the icon column and runs past
the header's end; it used to stick out on both sides, its start cut off under the icon column.

## Why

At 320px wide (a small phone, or a desktop browser zoomed to 400%) with a 16px gutter, the box
is 288px wide. A URL in the message or a long compound in the heading was cut off at the box's
edge (WCAG 1.4.10 Reflow). Unlike text that overflows the page, the cut-off part could not be
scrolled to either.

## Migration

Nothing to do. Boxes with long words get taller, so expect them to look different in
screenshots. A box in a flex row or a grid cell can now shrink below the width of its longest
word. A theme that prefers hyphenation can add `hyphens: "auto"`
to `CcInfoBox`'s `heading` and `details` slots; the browser then hyphenates in the language of
the page's `lang` attribute and still breaks anywhere where it cannot, e.g. in a URL.
