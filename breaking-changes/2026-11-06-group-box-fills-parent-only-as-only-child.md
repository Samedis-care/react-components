# GroupBox fills its parent's height only as the parent's only child

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/GroupBox`, and what renders a GroupBox as its frame: FileUpload,
  ImageSelector, MultiImage, HowToBox, the files and image renderers

## What changed

The GroupBox frame used to be `height: 100%` of its parent in every layout. It now fills
its parent's height only when it is the parent's only element child. Next to other
elements in the same parent (a heading above it, helper text below it, a hidden input) it
is as tall as its content.

The image renderer (`RendererImage`, editable) always renders helper text after its
ImageSelector, so an image field's frame no longer fills a stretched Grid item or card: it
is as tall as its content, like the text fields next to it. The same holds for a
CrudFileUpload while it shows its error above the upload.

The rule has zero specificity: a `height` from the theme
(`components.CcGroupBox.styleOverrides.root`), from a `styled(GroupBox)` wrapper or from a
`className` always replaces it.

## Why

A Grid item is stretched to its row, and the frame filled the whole item, which already
includes the frame's siblings. A heading above the frame pushed the frame's bottom into
the next row. Helper text below the frame, such as the image renderer's error or warning,
was pushed out of the item and drawn over the label of the next field. A frame that is
alone in its Grid item still fills it, so the frames of one Grid row stay equally tall.

## Migration

- Nothing is required. A frame that is the only element in its parent fills the parent
  as before; a frame with siblings now stays clear of them and of the next row.
- A layout that wants a frame with siblings to fill the rest of its parent (e.g. an image
  field whose frame should reach the bottom of a stretched column): make the parent a flex
  column and let the frame grow, e.g. `display: "flex", flexDirection: "column"` on the
  Grid item or card and `"& > fieldset": { flexGrow: 1 }`.
- `styled(GroupBox)({ height: "fit-content" })` and wrapper `<div>`s that only kept a
  frame from overlapping its siblings are no longer needed.
