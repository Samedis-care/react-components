# A GroupBox is as tall as its content in every parent

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/GroupBox`, and what renders a GroupBox as its frame: FileUpload,
  HowToBox, the loading frame of CrudFileUpload and CrudMultiImage, the files and string
  array renderers.
  ImageSelector and MultiImage keep their behavior.

## What changed

The GroupBox frame used to fill its parent's height when it was the parent's only element
child, wherever the parent's height was definite: a Grid item stretched to its row, a flex
column, a box of fixed height. It is now as tall as its content in every parent, as MUI's
`Card` and `Paper` are. A frame fills its parent when it is given a height, e.g.
`sx={{ height: "100%" }}`.

ImageSelector (normal and modern variants) sizes its picture by the space in its frame, so
its frame still fills a parent of definite height as the parent's only element child.

## Why

Whether a frame stretched depended on its parent, which the code that renders the frame does
not show. A frame next to taller content was mostly empty: in a side panel stretched to the
height of the form next to it, a frame of three lines was drawn as tall as the form. A frame
that is meant to fill its parent now says so where it is rendered.

## Migration

- **Required for any app that relies on a frame filling its parent:** frames side by side in
  one Grid row that should be equally tall, or a frame whose content fills a parent of
  definite height (a tree, a list or a video with `height: 100%` inside the frame, in a Grid
  item that grows or a dialog column). Without it, each frame is as tall as its content, the
  frames of a row end at different heights, and content with `height: 100%` inside the frame
  is only as tall as its own content. Give the frame a height:

  ```tsx
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6 }}>
      <GroupBox label={t("service")} sx={{ height: "100%" }}>…</GroupBox>
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <GroupBox label={t("contract")} sx={{ height: "100%" }}>…</GroupBox>
    </Grid>
  </Grid>
  ```

  HowToBox takes the same `sx`. FileUpload passes its `className` to its frame:
  `styled(FileUpload)({ height: "100%" })`.
- Frames in a Grid item with `display: "flex"` are stretched as flex items and need no
  change.
- `styled(GroupBox)({ height: "fit-content" })`, `height: "auto"` and similar overrides
  that only kept a frame from filling its parent are no longer needed.
