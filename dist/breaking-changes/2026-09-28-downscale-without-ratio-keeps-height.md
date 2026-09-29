# Down-scaling without keeping the ratio no longer stretches the height

- **Date:** 2026-09-28
- **Kind:** behavior
- **Scope:** `utils` (`processImage`, `processImageB64`), and every control that down-scales images with `keepRatio: false`

## What changed

With `keepRatio: false`, each side is limited to its maximum on its own. The height used
to be checked against the image's _width_, so an image that was too wide but low enough
was stretched to the maximum height. For example, a 3000 × 200 image with a maximum of
2500 × 300 became 2500 × 300 and now becomes 2500 × 200.

## Why

The height is only meant to be reduced when it is larger than the maximum.

## Migration

Nothing to do. Wide, low images down-scaled with `keepRatio: false` keep their height.
