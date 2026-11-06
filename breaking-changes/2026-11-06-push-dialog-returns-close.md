# pushDialog returns a close for the dialog it pushed; PushedDialogCloseContext is exported

- **Date:** 2026-11-06
- **Kind:** API, type
- **Scope:** `framework/DialogContextProvider` (`pushDialog`, `DialogContextType`), `framework/PushedDialogCloseContext` (`PushedDialogCloseContext`, `PushedDialogClose`)

## What changed

- `pushDialog(dialog)` returns a function that closes that dialog, and only that one, also
  while dialogs pushed after it are open. It is the function `useCloseThisDialog()` returns
  inside the dialog (and inside the content of a `FullFormDialog` that was pushed), the same
  one for the life of the dialog. Calling it again, or after the dialog was closed another
  way (`popDialog`, the dialog's own close), does nothing.
- `DialogContextType[0]` is `(dialog: React.ReactNode) => () => void`. It returned `void`.
- `PushedDialogCloseContext` and the type of its value, `PushedDialogClose`, are exported
  from the package root. Reading the context gives `null` outside a dialog shown with
  `pushDialog`, where `useCloseThisDialog` throws.

## Why

`popDialog` closes the top-most dialog. Code that pushed a dialog and closes it later, from
outside the dialog (when a request finishes, a timeout, the page that opened it), closed
another dialog when one had been pushed in the meantime, and it could not use
`useCloseThisDialog`, which works only inside the dialog. The returned function closes the
dialog by identity. Exporting the context lets a component check whether it is inside a
pushed dialog without catching an error, and lets a dialog that is rendered from state, or a
test, provide the close that `useCloseThisDialog` returns.

## Migration

- **Required for every hand-written `pushDialog`** (a `DialogContext.Provider` value, a test
  double typed as `DialogContextType` or `DialogContextType[0]`): it has to return a close
  function, or it stops type-checking. For example
  `vi.fn<DialogContextType[0]>(() => () => {})`. A mock that is cast
  (`as unknown as DialogContextType`) still compiles, but code under test that calls the
  returned close then fails: give it an implementation that returns one.
- **Required for a concise arrow that returns `pushDialog(…)` where React uses the return
  value**: `useEffect(() => pushDialog(<X />), [])` now returns the close as the effect's
  cleanup, so the dialog closes when the component unmounts or the effect runs again. Use a
  block body, `useEffect(() => { pushDialog(<X />); }, [])`, to keep the dialog open, or keep
  the concise arrow when closing it with the component is what you want. The same goes for a
  ref callback in React 19. Event handlers (`onClick={() => pushDialog(…)}`) are not
  affected.
- Code that pushes a dialog and closes it later from outside the dialog should keep the
  returned function and call it instead of `popDialog`:

  ```tsx
  const closeProgress = pushDialog(<ProgressDialog />);
  try {
  	await upload();
  } finally {
  	closeProgress(); // popDialog() would close the top-most dialog, which may be another one
  }
  ```

  Inside the dialog, `useCloseThisDialog()` returns the same function.
- A component that may be shown in a pushed dialog or outside one can read
  `useContext(PushedDialogCloseContext)` (`null` outside) instead of `useCloseThisDialog`.
- A dialog rendered from state can provide the context, with `pushed: true` like
  `DialogContextProvider`, so that `useCloseThisDialog` works in its content:

  ```tsx
  const dialogClose = useMemo(
  	(): PushedDialogClose => ({ close: () => setOpen(false), pushed: true }),
  	[],
  );
  return open ? (
  	<PushedDialogCloseContext.Provider value={dialogClose}>
  		<MyDialog />
  	</PushedDialogCloseContext.Provider>
  ) : null;
  ```
