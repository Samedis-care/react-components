# MultiImage shows "2 / 30" instead of dots that do not fit in one row

- **Date:** 2026-11-21
- **Kind:** behavior, theme
- **Scope:** `standalone/FileUpload/MultiImage` (`ImageDots`, `ImageBox`)

## What changed

- The dots under MultiImage's page preview and in its full-screen view (`ImageDots`) are shown
  only while all of them fit in one row. Otherwise a counter takes their place: "26 / 30",
  the shown image and the number of images, which screen readers read as "Image 26 of 30"
  (the existing text `standalone.file-upload.multi-image.image-position`). The images are
  then reached through Previous, Next and swiping. The dots come back when the row gets wide
  enough, or enough images are removed. A 300px wide field fits about 10 dots (9 beside
  Edit), the full-screen view in a 1200px wide window 47.
- In the full-screen view the dots, or the counter, are centred under the image. They used
  to start at the view's centre and run to the right. Beside the dots, the pointer reaches
  the image and the swipe pane below them.
- Theme slots of `CcImageDots`:
  - New slots `counter` (the "26 / 30") and `counterLabel` (its visually hidden text), also
    as keys of `classes`.
  - `container` is a flex row 12px in from both sides of the root, with a 12px gap between
    the dots and the dots centred vertically. The dots (`imageDot`) have no margin of their
    own anymore: a margin set on `imageDot` in a theme adds to the gap.
  - `root` is a flex container that clips horizontally only (`overflow-x: clip`, it was
    `overflow: hidden`), so a dot's focus ring, and the bottom of the dots in a read-only
    field, are no longer cut off. Its `justifyContent` sets where the dots and the counter
    start (`flex-start`; the full-screen view sets `center`).
- Theme slots of `CcImageBox`: `imageDotsWrapper` spans the width of the full-screen view
  (`left: 0`, `right: 0`, no `transform`) and lets the pointer through except on the dots;
  `imageDots` sets `justifyContent: center` instead of unsetting `position` and `overflow`.

## Why

The dots were one row that did not wrap, cut off where the field ended. With many images the
row was cut off, often including the dot of the shown image, and the images behind the cut
could not be reached by dot. In the full-screen view the row started at the centre and ran
off the right edge.

## Migration

Nothing is required. Expect "n / m" instead of dots in screenshots of galleries with many
images, or of narrow fields with fewer, and centred dots in the full-screen view. A theme
that overrides the margins or the position of `CcImageDots.container` or
`CcImageDots.imageDot`, or of `CcImageBox.imageDotsWrapper`, should be checked against the
new layout.
