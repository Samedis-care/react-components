# ComponentWithLabel's `onClick` runs once per click on the caption

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/UIKit/ComponentWithLabel`, and through it the DataGrid header's
  Settings, Reset, Export and Import buttons at `md` and up

## What changed

An `onClick` on ComponentWithLabel runs once per click on the control or on its caption.
It used to run twice for a click on the caption: once for that click, and once for the
click the `<label>` then forwards to its control, which bubbles back up through the label.

- For a click on the caption, `onClick` gets that click (its `target` is the caption, its
  `currentTarget` the `<label>`). The click the label forwards no longer calls it. That
  click still activates the control (a checkbox toggles, the control's own `onClick`
  runs) and still bubbles on to the label's ancestors, unless `onClick` stopped the click
  on the caption with `stopPropagation()`: then it stops at the label as well.
- A click on the control and a keyboard activation of it call `onClick` once, as before.
- An `onClick` on the control itself runs once per click on the caption, as before.

In the DataGrid header, a click on the "Import" caption calls `handleImport` once, so a
CRUD opens its import page once instead of pushing it onto the history twice.

## Why

A single click on a caption ran the action twice: a navigation added two history entries,
so Back returned to the same page first, and a toggle undid itself.

## Migration

- An app with an `onClick` on ComponentWithLabel only, or on the control only, has nothing
  to do.
- **Required for any app that gives the control and ComponentWithLabel the same
  `onClick`** (e.g. so that `stopPropagation()` keeps a click on the button as well as on
  the caption from a clickable ancestor): it still runs twice for a click on the caption,
  once from ComponentWithLabel and once from the control. Remove the control's `onClick`
  and keep ComponentWithLabel's, which now covers clicks on the caption and the control and
  the control's keyboard activation, and whose `stopPropagation()` also stops the click
  the label forwards:

  ```tsx
  <ComponentWithLabel
  	control={
  		<IconButton color={"primary"} aria-label={label}>
  			{icon}
  		</IconButton>
  	}
  	labelText={label}
  	labelPlacement={"bottom"}
  	onClick={handleClick}
  />
  ```
