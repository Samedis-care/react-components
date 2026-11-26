# A read-only BackendDataGridMultiSelect has disabled checkboxes and calls no onChange

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`BackendDataGridMultiSelect`),
  `backend-integration` (`ModelDataTypeBackendDataGridMultiSelectRenderer`)

## What changed

With `readOnly` (as a form field: a read-only visibility, or a read-only form):

- The row checkboxes are disabled: greyed out, not in the Tab order, and announced as
  unavailable. A click on a row or on its checkbox ticks or unticks nothing. A
  `canSelectRow` passed to the component is not used while it is read-only.
- There is no select all checkbox, also with `enableSelectAll`.
- `onChange` is never called. Before, a tick called it with a copy of `selected`, so that
  the parent's next render took the tick back.
- The search, the filters, the sorting and the scrolling work as before.

A form is read-only while it saves, so the field shows disabled checkboxes then too.

## Why

The checkboxes of a read-only field looked and were announced as operable. A tick showed
until the parent rendered again, or stayed with a parent that ignored the call, and nothing
said that the field could not be changed.

## Migration

Nothing required. Expect greyed-out checkboxes and no select all checkbox in screenshots of
read-only forms with this field. An `onChange` handler of a read-only
`BackendDataGridMultiSelect` is no longer called: there is no tick to take back.
