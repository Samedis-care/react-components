# A FullFormDialog title that shows after loading takes the focus

- **Date:** 2026-11-24
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`FullFormDialog`, `FormDialogDefaultRenderer`,
  `useSetFormDialogTitle`), and through it `PageTitle` inside a `FullFormDialog`

## What changed

When the title of a `FullFormDialog` shows only after the dialog opened, and the keyboard
focus is still on the dialog itself, the focus moves to the title. This is the case for
content that sets the title through the dialog-title context once it has loaded: a form page
with a `PageTitle` or `useSetFormDialogTitle` shows only a loader until its record is there.

- The dialog opens as before: MUI's focus trap focuses the dialog (its paper, the element
  with `role="dialog"`).
- If the dialog has been on screen for a frame without a title, the title heading gets the
  focus when it shows, and screen readers read the title. The heading gets
  `tabindex="-1"`, which makes it focusable without adding it to the tab order. Tab and
  Shift+Tab go on from it as from the dialog.
- After the dialog was opened with the keyboard, the browser draws its focus ring around the
  title; after a mouse click it doesn't.
- Focus that moved elsewhere before the title showed (the user tabbed to a button, the content
  focused a field) stays where it is.
- A title shown when the dialog opens, from `dialogTitle` or set by the content as it mounts,
  leaves the focus on the dialog, as before.
- When the title goes away while it has the focus (the content that set it unmounts, e.g. a
  page inside the dialog navigates to the next one), the dialog gets the focus back instead of
  the page. The next title that shows takes it again.

## Why

Screen readers announce a dialog with its name when the focus moves into it, and a
`FullFormDialog` is named by its title. A title that the content sets only after loading came
after that announcement: the dialog was announced as just "dialog", and the title was never
read. Moving the focus to the title, as the dialog pattern of the WAI-ARIA Authoring Practices
allows for a dialog that starts with static content, makes screen readers read it.

## Migration

Nothing required. A dialog whose content sets its title after loading needs no `aria-label`
for screen readers to hear the title.

What to expect:

- Screenshots or visual tests taken after opening such a dialog with the keyboard show a focus
  ring around its title.
- Browser tests that check where the focus is after such a dialog has loaded find it on the
  title heading, not on the dialog.
- A custom `renderer` that renders its own dialog instead of `FormDialogDefaultRenderer` does
  not get this behavior.
