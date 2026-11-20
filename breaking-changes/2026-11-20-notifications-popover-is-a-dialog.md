# Notifications: the popover is a dialog, and the bell says it opens one

- **Date:** 2026-11-20
- **Kind:** behavior, type
- **Scope:** `standalone/Notifications`

## What changed

The popover's paper is a modal dialog: `role="dialog"`, `aria-modal="true"`, named by its
"Notifications" heading through `aria-labelledby`, with a generated `id`. Focus moves to it
when it opens, as before, so a screen reader now announces "Notifications, dialog".

The bell has `aria-haspopup="dialog"`, `aria-expanded` (`"false"` or `"true"`) and, while
the popover is open, `aria-controls` with the paper's `id`.

A `PopoverProps.slotProps.paper` of your own (an object, or a function of the owner state)
is spread over the dialog's `role`, `aria-modal` and `aria-labelledby`, so it can change
them; the paper's `id` stays the component's, as the bell refers to it. `IconButtonProps`
no longer accepts `aria-haspopup`, `aria-expanded` or `aria-controls`: the component sets
them.

## Why

Focus moved to an element without a role or a name, which browsers expose as a generic
element named by the text of every notification in it. Screen-reader users were not told
that a dialog had opened or what it was, and the bell did not say that it opens a popup or
whether that was open (WCAG 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships).

## Migration

**Required for SCF** (`src/utils/markdownLinks.ts`): the markdown link handler opens an
in-app link that sits inside `[role="dialog"]` in a new tab, because a dialog would stay
open over the page the link routed to. The notification messages are inside such an
element now, so without a change an in-app link in a notification opens a new tab instead
of routing in place and closing the popover (`closeAutoClosablePopovers`). Treat the
notification popover, whose root has the class `popover-auto-closable`, as not a dialog
there:

```ts
const dialog = anchor.closest('[role="dialog"]');
// the auto-closable popovers close after routing, so their links route in place
const inDialog = !!dialog && !dialog.closest(".popover-auto-closable");
```

**Required for apps that pass `aria-haspopup`, `aria-expanded` or `aria-controls` in
`IconButtonProps`**: remove them; they no longer compile, and the component's own values
replace them. SCF and IMF pass none.

Tests that look up a dialog by its role find the notification popover too while it is
open.
