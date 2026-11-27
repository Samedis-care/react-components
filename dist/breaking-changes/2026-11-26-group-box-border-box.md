# A GroupBox's width and height include its padding and border

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/GroupBox`, and what renders a GroupBox as its frame: FileUpload,
  HowToBox, ImageSelector, MultiImage, the loading frame of CrudFileUpload and
  CrudMultiImage, the files and string array renderers.

## What changed

The GroupBox's fieldset has `box-sizing: border-box`. Its `width: 100%`, the height it
takes as its parent's only child, and a width or height given to it by the theme or a
`styled(GroupBox)` wrapper include its 8px padding and its 1px border.

The frame used to take its `box-sizing` from the page: `border-box` under MUI's
`CssBaseline`, which sets it on every element, and `content-box` elsewhere. With
`content-box` the frame was 18px wider than its parent and stuck out on the right, and as
its parent's only child it also stuck out 18px at the bottom.

Under `CssBaseline` (`box-sizing: inherit`), the frame's content inherits `border-box` from
the frame, also inside a subtree that sets `content-box`.

## Why

The frame is meant to fit its parent, whatever the page's `box-sizing` reset.

## Migration

- A page under MUI's `CssBaseline` (which `Framework` renders): nothing changes.
- Required for any app that renders a GroupBox without `CssBaseline` and compensates for
  the overflow, e.g. `styled(GroupBox)({ width: "calc(100% - 18px)" })`: remove the
  compensation, or the frame ends up 18px narrower than its parent. A width or height given
  to the frame now includes its padding and border.
