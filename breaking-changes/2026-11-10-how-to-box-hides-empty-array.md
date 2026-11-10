# A HowToBox with an empty labels array renders nothing

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/HowToBox` (`HowToBox`, `HowToBoxTranslate`); where the library
  shows it: the first step of the CRUD import (`importHowTo`)

## What changed

`<HowToBox labels={[]} />` now renders nothing, as `labels={undefined}` does. It used to
render the frame with its title ("How it works" or `titleLabel`) around an empty list.
`HowToBoxTranslate` renders nothing as well when its `labels` key holds an empty array.

## Why

A box without entries has nothing to say: sighted users saw an empty frame, and screen
readers entered a "How it works" group that held nothing. Callers guard the box with
`howTo && …`, which lets an empty array through, e.g. a how-to list that a filter or an
empty translation array leaves without entries.

## Migration

Nothing to do. Code that renders an empty array no longer shows the empty frame; expect it
to be gone from screenshots. An app that wants a frame without entries has to render it
itself, e.g. with a `GroupBox`.

The CRUD import step still treats an empty `importHowTo` as a how-to: it keeps the data
preview hidden. Pass `undefined` instead of an empty array to get the preview.
