# A GroupBox's title breaks long words

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/GroupBox`, and what renders a GroupBox as its frame: FileUpload,
  HowToBox, ImageSelector, MultiImage, the loading frame of CrudFileUpload and
  CrudMultiImage, the files and string array renderers.

## What changed

The GroupBox's legend (theme name `CcGroupBox`, slot `legend`) now sets
`overflow-wrap: anywhere`. A word in the title wider than the frame, such as a long
compound, a file name or a URL, is broken onto the next line inside the frame. It used to
run over the frame's right border, paint over whatever was to the frame's right, and make
the page wider than the screen on a phone. In a flex row whose item keeps the default
`min-width: auto`, such a title also widened the frame and the row. Titles without such a
word are laid out as before: they wrap at spaces.

An element passed as the `label` inherits the rule, unless it sets `overflow-wrap` itself.

## Why

At 320px wide (a small phone, or a desktop browser zoomed to 400%) with a 16px gutter, the
frame is 288px wide. A German compound or a file name in a title ran past the frame, and
the page scrolled sideways (WCAG 1.4.10 Reflow).

## Migration

Nothing to do. Frames with such a title get a taller legend, so expect them to look
different in screenshots. A theme that prefers hyphenation can add `hyphens: "auto"` to
`CcGroupBox`'s `legend` slot; the browser then hyphenates in the language of the page's
`lang` attribute (also words that would wrap at a space) and still breaks anywhere where it
cannot, e.g. in a file name.
