# MobileScalingFix keeps the page's other viewport directives

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/MobileScalingFix`, and so `Framework` (unless
  `disableMobileScalingFix` is set)

## What changed

MobileScalingFix, which Framework renders, replaced the whole `content` of the page's
`<meta name="viewport">` with `width=…, initial-scale=1` (plus `maximum-scale=1` on iPhone
and iPod). Every other directive the page had in it was gone once Framework mounted.

Now it sets only `width`, `initial-scale` and, on iPhone and iPod, `maximum-scale`, and
keeps every other directive of the meta as the page wrote it: `viewport-fit`,
`interactive-widget`, `user-scalable`, and on other platforms a `maximum-scale` or
`minimum-scale` of the page's own. A directive it sets replaces the page's value in place
(also when the page writes its name in another case or twice). The content is written
back with ", " between the directives.

## Why

A page could not keep `viewport-fit=cover` (content under the safe-area insets of notched
phones) or `interactive-widget=resizes-content` (how the on-screen keyboard resizes the
page): Framework removed them.

## Migration

Nothing to do for SCF and IMF: SCF's index.html has no viewport meta, and IMF's has only
`width=device-width, initial-scale=1`. An app whose index.html viewport meta has other
directives now keeps them while it runs, not only until Framework mounts: remove the ones
it does not want there, in particular zoom restrictions such as `maximum-scale=1` or
`user-scalable=no`.
