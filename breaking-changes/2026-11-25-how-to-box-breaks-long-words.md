# HowToBox entries break long words

- **Date:** 2026-11-25
- **Kind:** behavior
- **Scope:** `standalone/HowToBox` (`HowToBox`, `HowToBoxTranslate`)

## What changed

Each HowToBox entry (theme name `CcHowToBox`, slot `li`) now sets `overflow-wrap: anywhere`.
A word wider than the entry, such as a long compound, a file name or a URL, is broken onto
the next line inside the entry. It used to run over the frame's right border and make the
page wider than the screen. Entries without such a word are laid out as before.

## Why

At 320px wide (a small phone, or a desktop browser zoomed to 400%) with a 16px gutter, an
entry's text is 246px wide. A German compound or a download URL in a translated how-to ran
past the frame, and the page scrolled sideways (WCAG 1.4.10 Reflow).

## Migration

Nothing to do. Entries with long words get taller, so expect them to look different in
screenshots. A theme that prefers hyphenation can add `hyphens: "auto"` to `CcHowToBox`'s
`li` slot; the browser then hyphenates in the language of the page's `lang` attribute (also
words that would wrap at a space) and still breaks anywhere where it cannot, e.g. in a URL.
