# A Toast rendered closed calls onExited right away

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Toast`, and so the Framework's toasts (`useToastContext`)

## What changed

`Toast` called `onExited` only at the end of its close transition. A toast rendered closed
without having been in the page (mounted with `open={false}`, or opened and closed again in
the same update) runs no transition: MUI's Snackbar renders nothing for it, and `onExited`
was never called.

Now such a toast calls `onExited` once, right after that render. A toast that was in the
page calls it at the end of its close transition, as before. Under StrictMode it is still
called once.

## Why

The ToastContext waits for the shown toast's `onExited` before it shows the next one. Two
`showToast` calls in one update (a save that reports a warning and then a success), or a
`showToast` followed by `closeToast`, left it waiting for a toast that never appeared: that
toast never showed, and neither did any later one until a reload. Now the newest toast
shows, and later toasts keep working.

## Migration

Nothing to do for SCF and IMF: they show toasts through `useToastContext` only. A component
that renders a `Toast` closed before it first opens it now gets one `onExited` call at mount;
if that handler clears the toast's content or unmounts it, nothing changes on screen.
