# A GroupBox in a parent with a max-height encloses its content

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/GroupBox`, and what renders a GroupBox as its frame: FileUpload,
  HowToBox, the loading frame of CrudFileUpload and CrudMultiImage, the files and string
  array renderers.
  ImageSelector and MultiImage keep their behavior.

## What changed

The GroupBox frame used to take over its parent's `max-height` (`max-height: inherit`). In a
parent with a max-height, the frame stopped at that height while its content ran on below
the frame's bottom border, and what came after the frame was laid out at that height, over
the content. A max-height in percent was taken over as the same percentage, of a different
box.

The frame no longer takes over its parent's max-height. It is as tall as its content, and a
parent with `overflow: auto` scrolls.

ImageSelector (normal and modern variants) and MultiImage shrink their picture to the space
in their frame, and keep taking over a max-height: ImageSelector's frame that of its parent,
MultiImage's frame that of MultiImage's root (`className`, `classes.root` or the theme's
`styleOverrides.root`). Both still stop at that height with the picture shrunk to fit.

## Why

The rule was meant for the picture fields, but applied to every frame. A frame whose content
cannot shrink, such as a list of files or a group of fields, was cut off at the parent's
max-height, and its content was drawn over the elements after it.

## Migration

- Nothing is required. A frame in a parent with a max-height now encloses its content, and
  the parent scrolls or grows as its own `overflow` says.
- A layout that wants a frame itself to stop at a height: give the frame the max-height and
  let it scroll, e.g. `styled(GroupBox)({ maxHeight: 300, overflow: "auto" })`.
