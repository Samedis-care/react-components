# The image viewers zoom by buttons and keys

- **Date:** 2026-11-21
- **Kind:** behavior, theme
- **Scope:** `standalone/FileUpload` (`ImagePreviewDialog`, `ImageBox`), `utils` (`useImageZoomPan`),
  and everything built on them (`ImageSelector` in the `modern` variant, `MultiImage`, `CrudMultiImage`)

## What changed

- The full-screen views of `ImagePreviewDialog` and `ImageBox` show **Zoom in**, **Zoom out**
  and **Reset zoom** buttons right of the rotate buttons, in the top left corner (with
  `disableRotation` they take the rotate buttons' place). Zoom in and Zoom out change the
  zoom by a factor of 1.5, between 1× and 10×, and keep the centre of the view in view;
  Reset zoom goes back to 1×.
- In these views the keyboard zooms and pans, wherever the focus is in the dialog: `+` (or
  `=`) zooms in, `-` zooms out, `0` resets the zoom, and while zoomed in the arrow keys pan by
  a tenth of the view. At 1× the arrow keys do nothing, and a key pressed with Ctrl, Alt or
  Meta is left to the browser.
- The grab cursor shows only while the image is zoomed in, when dragging pans it. At 1× the
  view shows the default cursor.
- Theme slots: the rotate and zoom buttons sit in a new toolbar slot, `CcImagePreviewDialog`
  `toolbar` and `CcImageBox` `fullScreenToolbar`, which is the element positioned in the top
  left corner. `rotateButtons` and `fullScreenRotateButtons` are now groups inside it and no
  longer positioned themselves. New slots for the zoom buttons: `CcImagePreviewDialog`
  `zoomButtons`, `zoomInButton`, `zoomOutButton`, `resetZoomButton`; `CcImageBox`
  `fullScreenZoomButtons`, `zoomInBtn`, `zoomOutBtn`, `resetZoomBtn`.
- While zoomed in, the zoom container has the state class `CcImagePreviewDialog-zoomed`
  (slot `container`) or `CcImageBox-zoomed` (slot `fullScreenZoomContainer`).
- `useImageZoomPan` also returns `zoomIn`, `zoomOut`, `resetZoom`, `zoomed` (whether the
  image is zoomed in; the hook re-renders when it changes) and `handleKeyDown`.
- New translation keys `standalone.file-upload.zoom-in`, `standalone.file-upload.zoom-out`
  and `standalone.file-upload.reset-zoom`, in every locale.

## Why

Zooming and panning worked by wheel, pinch, double-click and drag only, so a keyboard user
could rotate a photo but never enlarge it, e.g. to read a type plate, and panning a zoomed
image needed a drag. The grab cursor promised dragging at 1×, where dragging does nothing.

## Migration

Nothing to do in general; expect the three buttons in screenshots of the full-screen
views.

- Required for an app whose theme positions the rotate buttons through
  `CcImagePreviewDialog.styleOverrides.rotateButtons` or
  `CcImageBox.styleOverrides.fullScreenRotateButtons` (e.g. `top`, `left`): those styles no
  longer move the buttons. Move them to `toolbar` / `fullScreenToolbar`:

  ```ts
  CcImagePreviewDialog: {
    styleOverrides: {
      toolbar: { top: 24, left: 24 }, // was: rotateButtons
    },
  },
  ```

- Custom viewers built on `useImageZoomPan` can offer the same: attach `handleKeyDown` to the
  element that holds the focus while the viewer is open (the dialog), render buttons for
  `zoomIn`, `zoomOut` and `resetZoom`, and show a grab cursor only while `zoomed`.
