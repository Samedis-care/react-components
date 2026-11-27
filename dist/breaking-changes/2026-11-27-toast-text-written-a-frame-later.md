# A toast's title and message are written into it a frame after it appears

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/Toast` (also every toast shown through the Framework's `useToastContext`)

## What changed

A toast's title and message are no longer in the page in the same update as the toast.
The toast's live region (the element with `role="status"`, or `role="alert"` for errors
and warnings) is inserted first, empty apart from its icon and close button, and the title
and message are written into it two animation frames later, while the toast is still
fading in. The same happens each time the toast opens again (also when a toast shown
through `useToastContext` replaces another one) and when a new `severity` switches the
toast between the two roles: the text is taken out and written again a frame later.

Components in the title or message therefore mount a frame after the toast opens, and
mount again each time it opens or switches its role. The close button stays where it is.

## Why

Screen readers announce a change to a live region they already know. A polite region
(`role="status"`, success and info toasts) inserted with its text already in it is often
not announced (NVDA with Chrome, VoiceOver with Safari), and neither is a text that comes
in the same update as a new role. Success and info toasts were therefore often silent
(WCAG 4.1.3 Status Messages).

## Migration

- Nothing to do in app code. Nothing changes visibly: the text comes in while the toast is
  still transparent. Only a `Toast` rendered directly whose `severity` switches between
  error/warning and success/info while it is shown is without its text for those two
  frames.
- Required for any app test that finds a toast by its role and checks its text right away
  (`expect(await screen.findByRole("status")).toHaveTextContent("Saved.")`): the role is
  found before the text is in, so the check fails. Wait for the text instead:

  ```ts
  await waitFor(() =>
  	expect(screen.getByRole("status")).toHaveTextContent("Saved."),
  );
  ```

  With fake timers, advance them by two frames (e.g. `vi.advanceTimersByTime(50)` inside
  `act`) after showing the toast. In a Storybook `play` function the same `waitFor`
  applies.
- A message component that keeps state of its own loses it when the toast opens again or
  its severity switches between error/warning and success/info: keep such state outside
  the toast.
