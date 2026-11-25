# A running delete shows its progress, and a finished one is announced

- **Date:** 2026-11-20
- **Kind:** behavior, type
- **Scope:** `standalone/DataGrid` (`deleting`), `backend-components/DataGrid`
  (`BackendDataGrid` and `CRUD` with `enableDelete`, `useBackendDataGridDeleteHandler`,
  `customDeleteSuccessHandler`)

## What changed

- New `DataGridProps.deleting`: while it is `true`, Delete shows a progress indicator in
  place of its icon and is unavailable (it keeps keyboard focus, so a second press does
  nothing), and the footer's actions are marked busy (`aria-busy="true"`).
- `BackendDataGrid` (and so `CRUD`) sets `deleting` while its delete request runs: from
  "Yes" in the confirmation until the backend has answered, not while the confirmation
  is open. `deleting` is not a prop of `BackendDataGrid`.
- Once a delete went through, the handler of `useBackendDataGridDeleteHandler` (which
  `BackendDataGrid` and `CRUD` use) shows a success toast through the Framework's
  `ToastContext`: "1 entry deleted", "2 entries deleted", or "The selected entries have
  been deleted" after a delete of everything except some entries (select all). The toast
  is a polite status (`role="status"`), so screen readers announce it. A cancelled or
  failed delete shows no toast; a failure still shows the error dialog (or
  `customDeleteErrorHandler`).
- New `BackendDataGridProps.customDeleteSuccessHandler(inverted, ids, filter)`: called
  instead of the toast once a delete went through, after the grid refreshes and before
  `onDeleteSettled`.
- The handler of `useBackendDataGridDeleteHandler` needs the Framework's `ToastContext`
  besides its `DialogContext`. Both are part of `Framework`.

## Why

A delete against a slow backend gave no feedback: after "Yes" the rows stayed, Delete
stayed available, and when the request returned the rows vanished silently. Screen
reader users could not tell whether the delete ran, was running or had failed (WCAG 4.1.3
Status Messages), and sighted users could press Delete again.

## Migration

Nothing to do for the progress and the toast themselves: every `BackendDataGrid` and
`CRUD` delete shows them, and so does any grid that uses
`useBackendDataGridDeleteHandler`.

- Required for a grid whose delete the user knows as something other than deleting, so
  that the toast does not say "deleted": pass `customDeleteSuccessHandler` and show your
  own wording, e.g. for a delete whose confirmation says "Remove {{count}} devices from
  the project?", a new translation such as "{{count}} devices removed from the project":

  ```tsx
  const [showToast] = useToastContext();
  const handleDeleteSuccess = useCallback(
    (_inverted: boolean, ids: string[]) =>
      showToast({
        severity: "success",
        message: t("inventorization:projects.devices.remove.done", {
          count: ids.length,
        }),
      }),
    [showToast, t],
  );
  // gridProps: { customDeleteSuccessHandler: handleDeleteSuccess, … }
  ```

  Passing a function that does nothing shows no message at all.
- Required where a test renders `BackendDataGrid`, `CRUD` or
  `useBackendDataGridDeleteHandler` under a `DialogContextProvider` without `Framework`:
  wrap it in a `ToastContextProvider` too, or the hook throws "ToastContext is missing".
- Required where a test counts the status regions (`role="status"`) or toasts after a
  delete: expect the success toast.
- A `DataGrid` with its own `onDelete` that sends a request can set `deleting` while that
  request runs, to get the same progress and busy state.
