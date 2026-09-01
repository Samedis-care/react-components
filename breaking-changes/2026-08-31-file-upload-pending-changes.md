# File uploads show which files were added and removed

- **Date:** 2026-08-31
- **Kind:** behavior
- **Scope:** `standalone/FileUpload`, `backend-components/FileUpload`, `backend-integration/Connector`

## What changed

A file whose upload is pending now renders its name in `palette.success.main`, and a file
pending removal renders it struck through with a **restore** control where its remove
button was. Unchanged files look exactly as before.

Removal is deliberately **not** coloured red. Red means error, and this is a pending
change, not a problem — and in the `modern`/`list` variant the file icons are already
`palette.error.main`, so a red name would say nothing. The marker sits on the file name
only; icons are untouched.

### Where the state comes from

Two different places, because the two ways of using the control keep the state in two
different places.

**`FileUpload` on its own** (which is what a form field does through `RendererFiles`)
already knew: `canBeUploaded` means the user picked the file and it is not on the server,
and `delete` means a server-side file is marked for removal. Nothing new is stored; the
control derives the display from the flags it already maintains.

**`CrudFileUpload` with a `LazyConnector`** — a form field backed by its own endpoint —
could not know. Its writes go through the connector, so by the time a file comes back from
`deserialize` a queued upload is indistinguishable from a file that was always on the
server, except for its `fake-id-` prefix, and a queued removal has had its `delete` flag
spent on the way into the queue.

That component's job is to hold the client's picture of the server, so it records the
answer on the files themselves as it queues each write, in `FileData.changeState`. The one
thing it mirrors out of the connector is whether anything is still waiting to be written:

```ts
lazyConnector.addQueueChangeListener((queue) => setQueueEmpty(queue.length === 0));
```

That single flag both drives the field level dirty marker and clears every per-file mark
once the queue has been worked — so a successful submit leaves the list looking unchanged
without anything having to walk it.

`changeState` is only needed where the flags cannot express it. Leave it unset and the
control derives the state itself from `canBeUploaded` and `delete`.

### New API

- `FileData.changeState?: "added" | "removed"`
- `FileProps.changeState`, `FileProps.onRestore`, `FileProps.restoreLabel`
- `FileUploadProps.onRestoreFile?: (file: FileData) => void` — called instead of the
  built-in restore, for an owner that has to undo something of its own
- `FileUploadRendererProps.restoreFile` — custom variant renderers get it alongside
  `removeFile`
- `FileClassKey` gains `restoreIcon` and `restoreIconBox`
- `LazyConnector.addQueueChangeListener(listener)`, returning an unsubscribe — separate
  from the single `setQueueChangeHandler` slot, which `useLazyCrudConnector` owns
- `LazyConnector.getQueuedOperation(id)` and `LazyConnector.cancelQueuedOperation(id)`,
  plus the exported `QueuedOperation` type
- `standalone.file-upload.restore` translation key, in all eight locales

### The field level dirty marker

`CrudFileUpload` is used as a *custom* form field — it is not in the model, so the form
holds no per-field dirty state for it and nothing hands it `dirty`. It does not need to be
told: with a lazy connector a non-empty queue *is* the pending change, which is the same
thing `useLazyCrudConnector` reports through `setCustomFieldDirty`. So the control answers
for itself:

```ts
const dirty = props.dirty ?? (lazyConnector ? !queueEmpty : undefined);
```

An explicit `dirty` prop still wins. With a direct connector nothing is pending, so no
marker is shown.

### Behavioural changes beyond the marker

- **A removed file stays in the list when the connector is lazy.** It used to be dropped
  from `CrudFileUpload`'s state as soon as the delete was queued. Keeping it is what makes
  the removal visible and undoable. With a direct connector nothing changes: the delete has
  already happened, so there is nothing to show and nothing to restore.
- **Removing a file whose upload was only queued takes it off the list** rather than
  marking it, since there is nothing on the server to remove. Its queued upload is
  cancelled, which `LazyConnector.deleteMultiple` already did.
- **`removeFile` and `restoreFile` no longer mutate the `FileData` in place.** `removeFile`
  used to set `file.delete = true` on the object and then hand out a copy of the array, so
  a consumer comparing entries by identity could not see the change. Both now replace the
  entry.
- A batched queued delete can now be **partially** cancelled: `deleteMultiple(["a","b","c"])`
  followed by `cancelQueuedOperation("b")` sends `deleteMultiple(["a","c"])`.

## Why

A long form with an attachment list gave no answer to "what am I about to change?". The
information existed in all three layers and reached none of them: the flags on `FileData`,
the `fake-id-` prefix, and the connector queue all knew, and the UI showed a flat list.

## Migration

Nothing to do. Expect the green names, the struck-through names and the restore control in
screenshots and visual regression baselines.

Two things to check:

- A custom `variant` renderer (`FileUploadRendererProps`) gets `restoreFile` but will not
  render a restore control until it uses it. Removed files will show in its list where the
  connector is lazy, so a renderer that assumed the list only holds live files should read
  `changeState`.
- Code that called `removeFile` and then read `file.delete` off the object it passed in
  will now read `false`. Read it off the array the change handler hands back instead.

`QueuedFunction` inside `LazyConnector` grew two optional fields (`deleteIds`,
`rebuildDelete`) so a delete can be re-created for a subset of its ids. It is private; the
queue change handler still receives the same array.
