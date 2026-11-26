# The busy overlay fades in late on every show, also when it is mounted shown

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/Form/FormLoaderOverlay`

## What changed

`FormLoaderOverlay` delays every show. When it is shown, its wash blocks the pointer at once,
stays transparent for 1s and then fades in over 500ms; hiding it is immediate, as before.
Before, this held only when `visible` turned true on an overlay that was already mounted. Two
cases now fade in late too, where they used to show the wash and spinner at once:

- an overlay mounted with `visible` already true, such as
  `{loading && <FormLoaderOverlay visible />}` or a loading view whose whole content is
  `<FormLoaderOverlay visible />`;
- a show within about 1.5s of hiding an overlay that had faded in (a second save right after
  the first, a busy reason that comes back).

The status message, and with `children` the `inert` and `aria-busy` content, still follow
`visible` at once. In a browser without CSS `@starting-style` (before Chrome 117, Safari 17.5,
Firefox 129), an overlay mounted shown still shows at once.

## Why

The delay keeps a busy phase shorter than 1s from flashing the wash and spinner. An overlay
mounted shown, or shown again right after a hide, skipped it, so a fast load or a fast second
save flashed the wash after all.

## Migration

- Nothing to do for an overlay that stays mounted and follows a busy flag, such as
  `visible={isSubmitting}` (the form pages' overlay does so).
- **Required for any app that shows the overlay as the only content of a loading view**, such
  as a dialog that renders `<FormLoaderOverlay visible />` until its data has loaded. Without
  it, that view stays blank, and blocks the pointer, for the first second of every load. Show a
  `Loader` there, which shows at once:

  ```tsx
  import { Loader } from "components-care";

  // before
  if (isLoading) return <FormLoaderOverlay visible />;
  // after
  if (isLoading) return <Loader />;
  ```

- An overlay mounted shown over content that stays on screen
  (`{loading && <FormLoaderOverlay visible />}` over a form) works as before, with the delay.
  Keeping it mounted, `<FormLoaderOverlay visible={loading} />`, does the same.
