# On phones the DataGrid moves header and footer buttons into their menus, so both fit 320px

- **Date:** 2026-11-25
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (header and footer below the `sm` breakpoint), and through
  it `BackendDataGrid` and the CRUD grids

## What changed

On phones (the `xs` breakpoint, below 600px):

- The header shows only the first add button (of an `onAddNew` array, or `BackendDataGrid`'s
  `onAddNew` with `additionalNewButtons`). The others are entries of "More options", below
  Columns, Reset, Export and Import, with their icon (MUI's Add by default) and label. An
  entry without `onClick` is disabled and shows its `disableHint` below the label.
- "More options" holds Columns, Reset, Export and Import not only beside a filter bar, but
  also beside a second add button, and when more than two of them sit beside an add button.
  Columns and Reset beside one add button, and all four without an add button, stay in the
  header.
- A single custom data action (`customDataActionButtons`) is an entry of the footer's "More"
  when select all, Edit and Delete are in the footer too. Two or more were entries already.
- The footer's hidden select all (without `enableSelectAll`, or with `disableSelection`)
  takes no place: the first action starts the bar, without a divider before it. On wider
  screens it keeps its place, so the actions stay aligned with the rows' content.
- The filtered count (`#567/1,234`) may break after the slash where the footer is short of
  room, and then takes two lines, aligned to the footer's end.

## Why

On a 320px phone, a header with Export, Import and an add button, or with two add buttons,
was wider than the screen: its buttons overlapped, so a tap near an edge hit the neighbour,
and the page scrolled sideways (WCAG 1.4.10 Reflow, 2.5.8 Target Size). So did a footer with
select all, Edit, Delete and a custom action, or with a custom action whose caption has a long
word beside a filtered count.

## Migration

Nothing to do in an app's code; expect the new header and footer in screenshots at phone
widths.

Required for any app whose tests or automation, at a phone width, click an add button other
than the first, or the single custom action of a footer that also has select all, Edit and
Delete: open the menu first and pick the entry (role `menuitem`). Without this the button is
not found. A test that expects the hidden select all checkbox in the footer at a phone width
finds none.

```tsx
// before: at a phone width
await user.click(screen.getByRole("button", { name: "Invite" }));
// after
await user.click(screen.getByRole("button", { name: "More options" }));
await user.click(await screen.findByRole("menuitem", { name: "Invite" }));

// the footer's custom action beside select all, Edit and Delete
await user.click(screen.getByRole("button", { name: "More" }));
await user.click(await screen.findByRole("menuitem", { name: "Archive" }));
```
