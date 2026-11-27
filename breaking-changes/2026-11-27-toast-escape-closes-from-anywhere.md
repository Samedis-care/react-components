# Escape closes a toast wherever focus is

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/Toast` (also every toast shown through the Framework's `useToastContext`)

## What changed

Escape closes an open toast (calls its `onClose`) wherever keyboard focus is, as MUI's
Snackbar does. Before, it did so only while focus was inside the toast. An Escape that
something else uses does not close the toast: an open dialog, menu, select or autocomplete
closes instead, as does anything else that stops the key or prevents its default. Escape
while focus is in the toast still calls `onClose` once.

A click elsewhere still leaves the toast open.

## Why

A toast can cover the control that has keyboard focus (at the bottom of the screen, or at
the top on phones, where it covers an app bar). A keyboard user could uncover it only by
moving focus into the toast, the last element of the page, or by waiting, and a toast with
`autoHideDuration: null` does not go away by itself (WCAG 2.4.11 Focus Not Obscured).
Escape now uncovers it without moving focus.

## Migration

Nothing to do for components built on MUI's popups: they stop the Escape that closes them.
A component of an app that handles Escape itself on the document or on a keydown listener
(e.g. to cancel an edit) and must not close the toast with it calls
`event.preventDefault()` (or `stopPropagation()` in a React handler) on that Escape.
