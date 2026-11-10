# A form page's footer is sticky, and its busy overlay covers only the form

- **Date:** 2026-11-10
- **Kind:** behavior, theme
- **Scope:** `standalone/Form` (FormPageLayout, FormLoaderOverlay), and so every form page
  that uses the library layout (BasicFormPage, DefaultFormPage, EditOnlyFormPage,
  FlowEngineFormPage)

## What changed

`FormPageLayout`:

- The footer (Save, Back) is `position: sticky` with `bottom: 36px`, in flow at the
  bottom of the layout, instead of `position: absolute` against the nearest positioned
  ancestor. It never sits lower than 36px above the bottom of the content area of
  whatever scrolls (a FormDialog's content, a scrolling panel, drawer or main area, or the
  viewport). While the body reaches below the visible area, the footer stays there and
  the body scrolls under it. Scrolled to the end, it rests at the same height below the
  last field.
- In a FormDialog the footer sits 20px higher than before: 36px above the dialog
  content's bottom padding instead of 36px above the dialog's edge.
- The root fills the height of its parent: in a flex column it grows into the space the
  other children leave (`flex-grow: 1`, as before), and as the only element of its parent
  it is at least as tall as that parent (`min-height: 100%`, new). The body grows. So on a
  short form Save stays where it was, at the bottom of the page, 36px above the bottom of
  the visible area, when the layout's parent reaches down to within 36px of it (a page
  container that fills the main area, as on IMF's profile and admin pages). A layout that
  ends higher (in a parent only as tall as its content, next to other content in a block
  parent, or in a box that does not scroll and ends further up) has its footer at its own
  bottom edge, where before it was at the bottom of the positioned ancestor or of the
  viewport.
- The body's 150px bottom padding is gone. The footer has a 66px margin above it: 30px
  between the last field and the footer, plus the up to 36px that `bottom: 36px` lifts it
  by at the bottom of the visible area. With FormButtons the space below the last field is
  still 150px.
- The root is `position: relative`. `other`, and absolutely positioned content in the
  body that has no positioned ancestor of its own, is placed against the layout. The busy
  overlay that BasicFormPage passes as `other` covers the form layout, however far it is
  scrolled, and nothing outside it: in a FormDialog the dialog title and its close button
  are no longer covered while saving, and on a page without a positioned ancestor (an app
  shell with a scrolling main area) the app header and menu are no longer covered.

`FormLoaderOverlay`:

- The spinner is centered on a new element of zero height, the theme slot
  `loaderAnchor`, which is `position: sticky` on the middle line of the visible area of the
  nearest scroll container (or the viewport), as far as the wash reaches. On a wash taller
  than what is shown of it, the spinner stays in the middle of what is shown. On a wash
  shown whole, it moves toward that line as far as the wash allows: on a small overlay away
  from the middle of the screen it sits off its center, but inside the wash.
- The root is a flex column with `padding: calc(theme.spacing(2) + 20px) 0` (half the
  Loader's height), which keeps the spinner inside the wash. The wash still covers the
  whole root.

## Why

The footer and the overlay were placed against whatever ancestor happened to be
positioned. Where that ancestor scrolled with the form (a Drawer's paper, a side panel with
`overflow: auto`, a page whose document scrolls), Save scrolled out of view with the
content, and the busy overlay covered only the first screen, so the rest of the form stayed
clickable while saving. The overlay now covers the whole form, which can be much taller
than the visible area, so its spinner is kept in the visible area instead of at the
form's center.

## Migration

- Nothing to do for form pages in a FormDialog or in an app shell whose main area scrolls.
- Required for a form page inside an element with `overflow: hidden` (or `overflow-x` /
  `overflow-y: hidden`) that is itself inside the element that scrolls: the footer sticks
  to the nearest ancestor with an `overflow` other than `visible`, and as that one does not
  scroll, the footer stays below the content and scrolls away. Use `overflow: clip` on that
  ancestor instead, which clips the same way without becoming a scroll container.
- A form page that shares a block parent with other content (a heading above it, say)
  does not fill that parent, so a short form has its footer right below its content plus
  66px: to keep Save at the bottom, make that parent a flex column
  (`display: flex; flex-direction: column`) or give the layout a parent of its own.
- Theme overrides: `CcFormPageLayout.styleOverrides.footer` that set `position`, `bottom`
  or `margin`, `root` overrides that set `min-height` or `flex-shrink`, and `body`
  overrides that relied on the 150px padding, need a review.
  `CcFormLoaderOverlay.styleOverrides.root` that sets `display` or `padding` changes where
  the spinner sits.
- Replacement layouts set through `CcBasicFormPage.defaultProps.formPageLayoutComponent`
  are not affected by the layout change. They still get `FormLoaderOverlay` as `other`,
  whose spinner is now kept in the visible area.
