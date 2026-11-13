# The sign dialog scales a stored signature to fit its sign area

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` (`SignDialog`), `non-standalone/SignaturePad`

## What changed

When the sign dialog opens on a stored signature, it shows the image scaled to fit the
sign area, keeping its aspect ratio, and centered in it, with 8px of space to the dotted
border. This is how the tile already shows it. A small signature is scaled up, a large one
scaled down.

It used to show the image at its pixel size in the top-left corner of the sign area. A
signature saved on a phone (about three times the pixels of a desktop one) ran out of the
sign area, over the Save and Clear buttons, and made the dialog scroll.

The `imageDiv` slot now fills the sign area (block, 100% x 100%, `padding: theme.spacing(1)`)
instead of being an auto-sized table cell, and the `signatureImage` slot fills `imageDiv`
with `object-fit: contain`.

## Why

The saved image's pixel size depends on the signing device (the canvas is the sign area
times `devicePixelRatio`, and the PNG is cropped to the ink), so its natural size says
nothing about how big it should look.

## Migration

Nothing to do in the apps. Theme `styleOverrides` for `CcSignPadDialog`'s `imageDiv` or
`signatureImage` slots that relied on the old table-cell layout need a look.
