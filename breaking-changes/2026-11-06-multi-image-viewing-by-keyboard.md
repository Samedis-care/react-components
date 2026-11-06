# ImageBox opens its full-screen view from a button, and MultiImage's dots are buttons

- **Date:** 2026-11-06
- **Kind:** behavior, type
- **Scope:** `standalone/FileUpload/MultiImage` (`ImageBox`, `ImageDots`, `MultiImage`)

## What changed

- An `ImageBox` without `onClick` (MultiImage's page preview, each image in the edit
  dialog, an `ImageBox` on its own) has a button around its image, named after the image:
  "Open photo.jpg in full screen", or "Open image in full screen" without a `fileName`.
  Click, Enter and Space open the full-screen view, and focus returns to the button when the
  view closes. The button shows the pointer cursor, MUI's ripple on click and a focus ring on
  keyboard focus.
  - New slot `openButton` (theme `CcImageBox`, key `openButton` in `classes`). It takes the
    image's place in the swipe pane: the swipe room on the sides is the button's margin now,
    and the image inside fills the button (`display: block`, no margin). A theme that sets a
    margin on `CcImageBox.image` no longer moves the image of the box (it still does in the
    full-screen view).
  - An `ImageBox` with an `onClick` function or `onClick={null}` is unchanged: no button.
- Previous and Next on the box are hidden by `opacity: 0` instead of `visibility: hidden`,
  so they stay in the tab order and the accessibility tree. They show while the box is
  hovered (with the 300ms fade as before), at once while the focus is in the box, and always
  on devices that cannot hover (`@media (hover: none)`, i.e. phones and tablets). They come
  after the image in the DOM: the tab order is the open button, Previous, Next. The rule
  applies to the IconButtons directly inside the box's root, no longer to every `button` in
  it.
- The dots (`ImageDots`, under the page preview and in the full-screen view) are buttons
  (`type="button"`) named after their position, "Image 2 of 3", and the dot of the shown image
  has `aria-current="true"`. Each dot is a tab stop and shows a focus ring on keyboard focus.
  The `imageDot` slot is a `button` now, not a `div`; its look is the same.
- New texts `standalone.file-upload.multi-image.open-full-screen` ("Open {{NAME}} in full
  screen"), `standalone.file-upload.multi-image.open-full-screen-unnamed` ("Open image in full
  screen") and `standalone.file-upload.multi-image.image-position` ("Image {{INDEX}} of
  {{TOTAL}}") in every locale.

## Why

Viewing worked by mouse only. The full-screen view opened from a click on a `div`, so a field
with one image, and an `ImageBox` on its own, had no tab stop at all. Previous and Next were
`visibility: hidden` until hovered, so the keyboard could not reach them and focus was lost
when the pointer left a focused one; on touch devices they showed only after a tap. The dots
were `div`s with a click handler, without a role, a name or a tab stop.

## Migration

Nothing is required. Code or tests that find the dots as `div`s, or Previous and Next by
their `visibility`, need updating.

Expect in screenshots: a focus ring on the image and on the dots on keyboard focus, Previous
and Next always shown on phones, and the pointer cursor over images that open the full-screen
view.
