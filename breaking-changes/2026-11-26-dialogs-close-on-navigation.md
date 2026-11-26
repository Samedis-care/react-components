# Pushed dialogs close when a navigation leads to another path

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `framework` (`DialogContextProvider`): every dialog shown with `pushDialog` or a
  `show…Dialog` helper, in Framework and in the providers of `CRUD` and `CrudMultiSelect`

## What changed

- A navigation to another path closes the dialogs that are open: a `Link` or `navigate()` in
  a dialog, browser Back and Forward, and a navigation the app starts from code
  (`FrameworkHistory.push`, `useNavigate`). The new page shows without the dialogs of the old
  one. They used to stay open over the new page.
- A navigation that changes only the search or the hash keeps the dialogs open, and so does a
  navigation that a blocker stops, e.g. "Leave form page?" answered with No. After Yes, the
  navigation closes the dialog the form is in.
- The dialogs that are open when the navigation happens close, also one pushed right before
  it in the same handler. A dialog pushed after the navigation stays.
- A dialog closed this way unmounts as with `popDialog`: its `onClose` is not called, and the
  promise of the `show…Dialog` helper that showed it does not settle, so the code awaiting it
  does not continue.
- When the element that opened the dialog went away with the old page, the focus moves to the
  heading of the new page, as after any navigation. Otherwise it returns to that element, as
  when the dialog is closed.

## Why

A link in a dialog navigated, but the dialog stayed on top of the new page, so the link seemed
to do nothing, and browser Back showed the previous page under a dialog of the page the user
had left. A dialog belongs to the page it was opened on, as a dialog that the page renders
itself goes away with the page.

## Migration

- Required for any app that pushes a dialog and then navigates in the same handler, meaning
  the dialog for the new page: the navigation closes it. Navigate first, then push the dialog:

  ```tsx
  navigate(`/devices/${id}`);
  void showInfoDialog(pushDialog, { title, message });
  ```

- Required for any app that calls `popDialog()` after an `await` (a request, a confirmation)
  to close the dialog it runs in: a navigation may have closed that dialog meanwhile, and
  `popDialog()` then closes another one or throws "Trying to close non-existing dialog".
  Close it with `useCloseThisDialog()` or the function `pushDialog` returned, which do nothing
  once the dialog is closed:

  ```tsx
  const close = useCloseThisDialog();
  const withdraw = async () => {
  	await save();
  	close(); // instead of popDialog()
  };
  ```

- Tests that navigate to another path while a dialog is open and then use the dialog: open it
  again after the navigation.
- Optional: code that closes its dialog before it navigates (`close(); navigate(…)`) keeps
  working, but no longer needs the close. A link in a dialog that opens a new tab only so that
  the dialog does not cover the new page can route in the current tab.
