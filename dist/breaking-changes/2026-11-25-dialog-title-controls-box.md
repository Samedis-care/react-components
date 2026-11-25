# DialogTitle: the action and the close button sit in a new box, and an action that doesn't fit moves below the title

- **Date:** 2026-11-25
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` (`DialogTitle`), and through it the title row of
  `FullFormDialog`

## What changed

- `DialogTitle` renders its `action` and its close button inside a new box, the slot
  `controls` (`classes.controls`, theme `styleOverrides.controls`), after the box around the
  heading. Before, the `action` box and the close button were children of the root.
- A title row with an `action` (in a `FullFormDialog`: controls the content sets with
  `useSetFormDialogTitleAction`, the `titleAction` prop, or the "Open in new tab" button)
  keeps at least `7rem` for the title. When the action and the close button don't fit beside
  that, they move below the title, at the end of the row, and the title takes the whole width.
  Controls that don't fit on one line there wrap, and the close button stays beside them. The
  root gets the class `CcDialogTitle-withAction` while it has an action.
- A dialog sized to its content (`fullWidth={false}`) with an action and a title shorter than
  `7rem` is up to that much wider.

A title row without an action looks as before. So does a `FullFormDialog` with only the
"Open in new tab" button at 320px: the button and the close button still fit beside the
title.

## Why

Dialog content can now put its own controls (Edit, More, …) into the title row, outside the
heading that names the dialog. On a phone several of them beside the title squeezed it to a
few letters per line. The close button is in one box with them so that it stays next to them
when they wrap.

## Migration

Required for any app that styles the close button or the `action` box of `DialogTitle`
through selectors on the root that rely on them being its children (e.g. `"& > button"`,
`"& > :last-child"` in `styleOverrides.root`): use the slots instead.

```ts
CcDialogTitle: {
	styleOverrides: {
		closeButton: { color: "inherit" },
		action: { gap: 4 },
		controls: { alignSelf: "flex-start" },
	},
},
```

Nothing else to do. Expect screenshots of a phone-sized dialog whose title row has several
controls to show them below the title.
