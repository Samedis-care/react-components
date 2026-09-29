# The image viewers rotate

- **Date:** 2026-09-29
- **Kind:** behavior
- **Scope:** `standalone/FileUpload` (`ImagePreviewDialog`, `ImageBox`), `utils` (`useImageZoomPan`),
  and everything built on them (`ImageSelector` in the `modern` variant, `MultiImage`, `CrudMultiImage`)

## What changed

- The full-screen views of `ImagePreviewDialog` and `ImageBox` show **Rotate left** and
  **Rotate right** buttons in the top left corner, across from the close button. Each click
  turns the image a quarter turn. A turned image is scaled to fit the view again, the zoom
  stays, and the part zoomed into stays in view.
- `ImageBox`'s full-screen view starts every image unzoomed and upright. Going to the next or
  previous image used to keep the zoom and pan of the image before.
- `useImageZoomPan` returns `rotateLeft` and `rotateRight`, and takes the image's `src` as an
  optional second argument: when it changes while open, zoom, pan and rotation reset. The
  transform it writes now ends in `rotate(<deg>)`, and the scale in it includes the fit of a
  turned image.
- New prop `disableRotation` hides the buttons: on `ImagePreviewDialog` and `ImageBox`, passed
  on by `ImageSelector` (modern variant), `MultiImage` and `CrudMultiImage`, and available as a
  `TypeImage` parameter.
- New theme slots: `CcImagePreviewDialog` `rotateButtons`, `rotateLeftButton`,
  `rotateRightButton`; `CcImageBox` `fullScreenRotateButtons`, `rotateLeftBtn`,
  `rotateRightBtn`.
- New translation keys `standalone.file-upload.rotate-left` and
  `standalone.file-upload.rotate-right`.

## Why

Photos taken with a phone or of a label mounted sideways often arrive turned, and reading them
meant turning your head. The rotation only changes the view, never the stored image.

## Migration

Nothing to do; expect the two buttons in screenshots of the full-screen views.

- If a viewer should not rotate, set `disableRotation` on it, or for a whole app through the
  theme: `CcImagePreviewDialog: { defaultProps: { disableRotation: true } }` (likewise
  `CcImageBox`).
- Custom viewers built on `useImageZoomPan` can drop their own rotation and call `rotateLeft` /
  `rotateRight`. The hook turns the element its `imgRef` is attached to, which has to be an
  `<img>` filling its box with `object-fit: contain`. Pass the `src` if the viewer switches
  images without closing.
