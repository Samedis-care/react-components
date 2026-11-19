# The form footer stays within its container, and its buttons wrap

- **Date:** 2026-11-19
- **Kind:** behavior
- **Scope:** `standalone/Form` (FormPageLayout) and `standalone/UIKit` (FormButtons)

## What changed

`FormPageLayout`:

- The footer is no longer shifted 36px to the right. Its buttons sit 36px further left
  than before, flush with the layout's left edge plus FormButtons' own 24px padding, and
  the same in a right-to-left layout (where the shift pushed the footer the other way).
- The footer is at most as wide as the layout (`max-width: 100%`). Before, it was as wide
  as its buttons with no limit, so in a form dialog on a 320px phone it reached past the
  paper, which then scrolled sideways (WCAG 1.4.10 Reflow).

`FormButtons` lays its buttons out with `wrap="wrap"` instead of `wrap="nowrap"`: buttons
that do not fit on one line continue on the next line instead of running past the bar's
right edge. Before, a `DefaultFormPage` with `extraButtons` (Save, Exportieren, Zurück)
reached x 432 in a 320px viewport.

Together, on a 320px phone the footer of every form page stays inside its page or dialog
and its buttons wrap.

## Why

The 36px shift and the unlimited width pushed the footer out of its container on a narrow
screen, so the page or dialog scrolled sideways (WCAG 1.4.10 Reflow), and keyboard focus on
the last button scrolled the whole page. FormButtons' `wrap="nowrap"` kept a third button
on the same line, past the edge.

## Migration

- Nothing to do for form pages that use the library layout: the footer is 36px further
  left and wraps on a narrow screen.
- Theme overrides that compensated for the 36px shift on the `footer` slot (a margin or
  `transform` of their own) can drop it.
- A custom footer that is a `FormButtons` and relies on a single line of buttons now gets
  them wrapped when the container is narrower than the buttons; give a footer that must
  keep its buttons apart another layout, or enough width.
- Replacement layouts set through `CcBasicFormPage.defaultProps.formPageLayoutComponent`
  (SCF's `SamedisFormPageLayout`, IMF's `ImFormPageLayout`) are not affected by the
  FormPageLayout change; the `FormButtons` they render wrap as described above.
