# The simple dialogs, SignDialog and LocaleSelectorDialog close only their own dialog

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` (`ErrorDialog`, `InfoDialog`, `ConfirmDialog`, `InputDialog`, `FormDialog`, `SignDialog`, and `showErrorDialog`, `showInfoDialog`, `showConfirmDialog`, `showConfirmDialogBool`, `showInputDialog`), `non-standalone/LocaleSelector` (`LocaleSelectorDialog`)

## What changed

- Their buttons, Escape, the backdrop and the close button close the dialog they were pushed
  in, and only that one. They used to close the top-most dialog (`popDialog`). A dialog pushed
  while one of them is open now stays open: one pushed from a button handler, or while an
  async handler runs, or from `SignDialog`'s `setSignature`, or by a `languageChanged`
  listener while `LocaleSelectorDialog` switches the language.
- Closing a dialog that is closed already does nothing. `LocaleSelectorDialog` closed with
  Escape while the picked language loads no longer shows "Trying to close non-existing
  dialog" once the language has loaded, and no longer closes the dialog below it.
- A component that is pushed and renders one of them (`pushDialog(<MyInfo />)`, where `MyInfo`
  returns an `InfoDialog`) closes that pushed dialog, also when another dialog is on top.
- A simple dialog rendered without `pushDialog` (from state, e.g.
  `{error && <ErrorDialog … />}`), or in the content of a `FullFormDialog`, closes through its
  callbacks, which have to stop rendering it: `ErrorDialog`, `InfoDialog`, `ConfirmDialog`
  and `FormDialog` through `onClose`, `InputDialog` through `onClose`, `handlerButtonYes`
  and `handlerButtonNo`. They used to throw
  "[Components-Care] Trying to close non-existing dialog", or to close the top-most pushed
  dialog, e.g. the `FullFormDialog` around them. Without such a callback nothing closes them.
  `SignDialog` and `LocaleSelectorDialog` have no `onClose`: rendered without `pushDialog`,
  nothing closes them.

## Why

`popDialog` closes the top-most dialog. That is another dialog when one was pushed after the
dialog that closes, and none when the dialog was not pushed.

## Migration

- Nothing to do for dialogs shown with `pushDialog` or the `show…Dialog` helpers.
- **Required for a simple dialog rendered without `pushDialog`:** give it an `onClose` that
  stops rendering it (for `InputDialog` also the button handlers), otherwise its buttons
  close nothing:

  ```tsx
  return error ? (
  	<ErrorDialog
  		title={t("error")}
  		message={error.message}
  		onClose={() => setError(null)}
  		buttons={[{ text: t("ok") }]}
  	/>
  ) : null;
  ```

- A `dontClose` button whose `onClick` closes the dialog with `popDialog()` still closes the
  top-most dialog. To close exactly this dialog, call the function `pushDialog` returned:

  ```tsx
  const close = pushDialog(
  	<InfoDialog
  		title={t("copy.title")}
  		message={t("copy.message")}
  		buttons={[
  			{
  				text: t("copy.go"),
  				dontClose: true,
  				onClick: async (onClose) => {
  					await copy();
  					close();
  					onClose?.();
  				},
  			},
  		]}
  	/>,
  );
  ```
