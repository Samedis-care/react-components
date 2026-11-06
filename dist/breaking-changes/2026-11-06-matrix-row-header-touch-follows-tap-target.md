# MatrixGrid tells renderRowHeader `touch` only while the header is the tap target

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

`MatrixRowHeaderContext.touch`, the context `renderRowHeader` receives, is true only while
the whole row header is one tap target: on a touch-only device (coarse pointer, no hover)
**and** with `onRowHeaderActions` set. It used to be true on every touch-only device, also
when `onRowHeaderActions` was not set (or set only for some users) and the header was no
tap target.

Neither samedis-ui nor identity-management-frontend uses `MatrixGrid` today.

## Why

`touch` tells the renderer to drop its own row action buttons, because the header takes
over. Without `onRowHeaderActions` nothing takes over: a renderer that followed `touch`
dropped its buttons, and the row's actions could not be reached on phones and tablets.

## Migration

Nothing to do for a renderer that uses `touch` to decide whether to show its own buttons.
A renderer that used `touch` for something else, such as a larger layout on touch
devices, gets `false` on touch-only devices without `onRowHeaderActions`; use
`useMediaQuery("(pointer: coarse) and (hover: none)")` for that instead.
