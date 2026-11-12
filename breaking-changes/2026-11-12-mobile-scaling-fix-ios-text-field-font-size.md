# MobileScalingFix no longer restricts zoom on iPhone; text fields get at least 16px on iOS

- **Date:** 2026-11-12
- **Kind:** behavior
- **Scope:** `standalone/MobileScalingFix`, and so `Framework` (unless
  `disableMobileScalingFix` is set)

## What changed

On iPhone and iPod (`navigator.platform`), MobileScalingFix added `maximum-scale=1` to
the page's `<meta name="viewport">`, so that focusing a text field with a font size below
16px did not zoom the page.

Now it never writes `maximum-scale` (or `user-scalable`). Instead, on iOS and iPadOS
(`navigator.platform` "iPhone", "iPod", "iPad", or "MacIntel" with touch points, which is
how iPadOS 13 and later report themselves) it renders a global style that gives text
fields the font size they inherit, but at least 16px. Text fields are inputs that take
typing or open a picker (not checkboxes, radios, ranges, buttons, file or color inputs),
selects, textareas and contenteditable elements, which includes the sections of the MUI X
date and time fields. On other platforms nothing changes. The style goes away when
MobileScalingFix unmounts.

The style takes precedence over a font size set on the field element itself, such as a
theme's `MuiInputBase` `input` or `MuiPickersInputBase` `sectionsContainer` override: such
a field takes the size of its container, at least 16px. A size above 16px set on the
container (the `MuiInputBase` `root` override, `slotProps.input` of a TextField) is kept.

## Why

`maximum-scale=1` is a zoom restriction (WCAG 1.4.4 Resize Text, axe `meta-viewport`).
Safari itself ignores it for pinch-zoom, but in-app browsers built on WKWebView honor it, so
a user who opened the app from such an app could not zoom in. iOS zooms into a focused
field only when its text is smaller than 16px, so fields of at least 16px need no
restriction. iPads were not detected before and zoomed into small fields; they now get the
16px fields too.

## Migration

- **SCF** (13px fields): on iPhone and iPad, text fields, date fields and native selects
  render at 16px and are a few pixels taller. Expect that in iOS screenshots, and check
  dense layouts with fixed heights (filter bars, inline edit rows) on an iOS device.
- **IMF**: its fields use MUI's default 16px, so they look the same.
- A field that should be larger than 16px on iOS needs its size on the container
  (`MuiInputBase` `root`, `slotProps.input`), not on the input element.
- Don't add `maximum-scale` or `user-scalable=no` to the index.html viewport meta:
  MobileScalingFix keeps the page's own directives, so it would bring the restriction back.
