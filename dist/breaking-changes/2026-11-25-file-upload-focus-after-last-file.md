# After the last file, focus steps back to the previous file's button

- **Date:** 2026-11-25
- **Kind:** behavior
- **Scope:** `standalone/FileUpload`: `FileUploadGeneric` in its built-in variants (classic
  and modern), and so `CrudFileUpload`; the new hook `useFileActionButtonFocus`

## What changed

- When a focused remove or restore button goes away with the last file of the list, as a
  removed pick leaves it, keyboard focus moves to the previous file's remove or restore
  button. It goes to the upload control only once no file's button is left. For any other
  file, focus moves to the next file's button, as before.
- The built-in variants key a file by its name, and how many files of that name come
  before it, instead of by its position. A file's preview is no longer built anew when a
  file before it leaves the list. With `CrudFileUpload` and a `LazyConnector`, removing a
  queued upload by keyboard now leaves focus on the next file's button; it used to move one
  file further, as the queued upload leaves the list a render after its button.
- New: `useFileActionButtonFocus(fallbackRef?)`, exported from the package root, gives a
  custom variant (`variant` as a component) the same focus handling. It returns the
  `actionButtonRef` for the FilePreview at each position; `fallbackRef` is the element that
  takes focus once no file's button is left, inside the variant or outside it.

## Why

A keyboard user who removes the last of several files stays in the list, next to where they
were, as after removing any other file. A custom variant had to rebuild the focus handling
itself, and the built-in variants lost the focus when a removed file left the list a render
after its button.

## Migration

- Tests that expect the upload control to have focus after the last of several files was
  removed: expect the previous file's remove or restore button.
- Any app whose custom variant moves the focus with its own copy of this logic: replace the
  copy with the hook, and key the files by something that stays with the file while files
  before it leave (a record id, or the name and how many files of that name come before
  it), never by position:

  ```tsx
  const MyVariant = (props: FileUploadRendererProps) => {
  	// the variant's own upload button, or a ref to an element outside it
  	const uploadRef = useRef<HTMLButtonElement>(null);
  	const getActionButtonRef = useFileActionButtonFocus(uploadRef);
  	return props.files.map((data, index) => (
  		<FilePreview
  			key={"id" in data.file ? String(data.file.id) : data.file.name}
  			actionButtonRef={getActionButtonRef(index)}
  			// …
  		/>
  	));
  };
  ```
