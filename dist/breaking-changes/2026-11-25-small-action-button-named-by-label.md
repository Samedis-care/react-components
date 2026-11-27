# A small ActionButton or SubActionButton is named by its label in every state

- **Date:** 2026-11-25
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`ActionButton`, `SubActionButton`)

## What changed

With `small`, ActionButton and SubActionButton still show only their icon, and their label
(`children`) still shows as a tooltip on hover and on keyboard focus. In addition:

- The label is inside the button as visually hidden text (a span with the class
  `CcActionButton-hiddenLabel` or `CcSubActionButton-hiddenLabel`), so it names the button
  in every state: with no tooltip open, while disabled, and when the label is a node such as
  a `<span>` or `<Trans>` element. A small ActionButton used to be named only while its
  tooltip was open, a small SubActionButton only when its label was a plain string, and
  neither while disabled.
- The tooltip no longer sets `aria-label` or `aria-labelledby` on the button. An
  `aria-label` or `aria-labelledby` passed to the button replaces the name taken from the
  label, also while the tooltip is open. The tooltip used to replace it with the label
  while open.

Nothing changes on screen.

## Why

Without a name, a screen reader announced an icon-only button as "button" alone, voice
control users could not activate it by saying its label, and a disabled one never told
anyone what it does. This included the DataGrid's add button at phone width.

## Migration

Nothing to do for the buttons themselves. An `aria-label` that repeats the label is no
longer needed.

Required for tests that look for the label of a small button as text: `queryByText(label)`
now finds the hidden label inside the button, and while the tooltip is open `getByText(label)`
finds two elements. Find the button with `getByRole("button", { name: label })` and the
tooltip with `getByRole("tooltip")`.

Required for tests that find a small SubActionButton with a string label by
`getByLabelText(label)` or by its `aria-label` attribute: the button has no `aria-label`
any more. Find it with `getByRole("button", { name: label })`.
