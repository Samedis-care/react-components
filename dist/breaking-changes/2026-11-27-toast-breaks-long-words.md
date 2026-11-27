# A toast breaks a word too long for a line and stays within the screen

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/Toast` (also every toast shown through the Framework's `useToastContext`)

## What changed

The toast's message (MUI's `.MuiAlert-message` inside the theme slot `CcToast` `alert`,
title included) now sets `overflow-wrap: anywhere`. A word wider than a line of the toast,
such as a long compound, a URL, a file name or an id in a server error, is broken onto the
next line. Messages without such a word look as before.

Below the `sm` breakpoint the toast (the `alert` slot) also gets `min-width: 0`, so it is
never wider than the screen. Content that cannot wrap at all (an image, an element with
`white-space: nowrap` or `pre`) scrolls sideways inside the message, as it already did on
wider screens, instead of widening the toast.

## Why

Below `sm` the toast spans the screen with 8px margins, and its text is about 200px wide
on a 320px screen (a small phone, or a desktop browser zoomed to 400%). A longer word made
the toast wider than the screen; anchored at the right, it ran past the left edge, taking
the icon and the start of the text with it, and a fixed toast cannot be scrolled into view
(WCAG 1.4.10 Reflow). On a wide screen a long URL did not wrap at the toast's 560px
maximum: the message got its own horizontal scrollbar.

## Migration

Nothing to do. Toasts with long words get taller, so expect them to look different in
screenshots. A theme that prefers hyphenation can add
`"& .MuiAlert-message": { hyphens: "auto" }` to
`theme.components.CcToast.styleOverrides.alert`; the browser then hyphenates in the
language of the page's `lang` attribute and still breaks anywhere where it cannot, e.g. in
a URL.
