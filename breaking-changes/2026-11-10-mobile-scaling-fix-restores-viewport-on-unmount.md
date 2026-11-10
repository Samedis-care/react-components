# MobileScalingFix puts the page's viewport back when it unmounts

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/MobileScalingFix`, and so `Framework` (when it unmounts, or when
  `disableMobileScalingFix` turns true while it is mounted)

## What changed

MobileScalingFix left its viewport in place after it unmounted: the page kept
`width=<minWidth>, initial-scale=1`, and a `<meta name="viewport">` it had appended to
`<head>` stayed there.

Now its unmount puts back the content the page's viewport meta had before it mounted, or
removes the meta it appended. Each `minWidth` change starts from that content too. A change
another script made to the meta while MobileScalingFix was mounted is therefore lost on
the next `minWidth` change and on the unmount.

## Why

Setting `disableMobileScalingFix` on a mounted Framework stopped further writes but kept
the last viewport, so the page could not return to the viewport its index.html sets.

## Migration

Nothing to do for SCF and IMF: both keep Framework mounted and never change
`disableMobileScalingFix` at runtime. An app that turns `disableMobileScalingFix` on at
runtime now gets its index.html viewport back (or none, if index.html has no viewport meta).
