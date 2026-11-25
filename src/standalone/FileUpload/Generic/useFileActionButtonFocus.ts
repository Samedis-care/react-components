import React, { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Keyboard focus for a list of files with remove and restore buttons (FilePreview's
 * `actionButtonRef`): when the focused button goes away with its file, focus moves to the
 * next file's button, after the last file to the previous one, and once no file's button
 * is left to `fallbackRef`, instead of falling to the page. FileUploadGeneric's built-in
 * variants use it with their upload control; a custom variant (`variant` as a component)
 * calls it itself.
 *
 * ```tsx
 * const MyFiles = (props: FileUploadRendererProps) => {
 *   const uploadRef = useRef<HTMLButtonElement>(null);
 *   const getActionButtonRef = useFileActionButtonFocus(uploadRef);
 *   return (
 *     <>
 *       <button ref={uploadRef} onClick={() => props.handleUpload()}>Add</button>
 *       {props.files.map((data, index) => (
 *         <FilePreview
 *           key={keyOf(data)} // a key that stays with the file, see below
 *           actionButtonRef={getActionButtonRef(index)}
 *           ...
 *         />
 *       ))}
 *     </>
 *   );
 * };
 * ```
 * @param fallbackRef The element that takes focus once no file's button is left, usually
 *        the upload control. It may lie outside the list, e.g. an attach button the app
 *        renders elsewhere, and is read when the focus moves. Unset, or while it is
 *        empty, focus is left where the browser puts it.
 * @returns The function that gives the FilePreview at a position (index) in the list its
 *          `actionButtonRef`. Both are stable: the function for the component's whole
 *          life, the ref it returns for each position.
 * @remarks The buttons are followed by position, so the list's keys must stay with their
 *          files while files before them leave: key a file by its record id, or by its
 *          name and how many files of that name come before it, as the built-in variants
 *          do, never by its position. A file can leave in two renders: CrudFileUpload with
 *          a LazyConnector first marks a removed queued upload, which takes its button
 *          (focus moves to the next file's), and drops it a render later. With keys by
 *          position the next file's FilePreview is then built anew, its button loses the
 *          focus, and the focus moves one file further.
 *
 *          Focus is only taken over when it went with the button: a remove by mouse, with
 *          the focus elsewhere, leaves it there. Focus moves once the component that
 *          called this hook renders again, which it does when its files change.
 */
const useFileActionButtonFocus = (
	fallbackRef?: React.RefObject<HTMLElement | null>,
): ((index: number) => React.RefCallback<HTMLButtonElement>) => {
	// the button at each position, null where that file shows none
	const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
	// one ref callback per position, so that React calls it only when the button at that
	// position changes
	const refsRef = useRef<React.RefCallback<HTMLButtonElement>[]>([]);
	// the position of a button that went away with the focus on it, until focus moved on
	const refocusFromRef = useRef<number | null>(null);

	const getActionButtonRef = useCallback((index: number) => {
		const refs = refsRef.current;
		refs[index] ??= (elem: HTMLButtonElement | null) => {
			const buttons = buttonsRef.current;
			const prev = buttons[index];
			buttons[index] = elem;
			// React detaches a ref before it removes the element, so the focus is still on it
			// here. A button that only moves to another position (a file before it left) is
			// detached as well while it keeps the focus: the effect below then leaves it.
			if (!elem && prev && prev.ownerDocument.activeElement === prev) {
				refocusFromRef.current = index;
			}
		};
		return refs[index];
	}, []);

	// runs after the buttons' refs are set, as the files are rendered below the component
	// that called this hook
	useLayoutEffect(() => {
		const index = refocusFromRef.current;
		if (index == null) return;
		refocusFromRef.current = null;
		const buttons = buttonsRef.current;
		const target =
			buttons.slice(index).find((btn) => btn != null) ??
			buttons
				.slice(0, index)
				.reverse()
				.find((btn) => btn != null) ??
			fallbackRef?.current;
		if (!target) return;
		// only take over focus that was lost with the button, never move it away from elsewhere
		const active = target.ownerDocument.activeElement;
		if (active && active !== target.ownerDocument.body && active.isConnected)
			return;
		target.focus();
	});

	return getActionButtonRef;
};

export default useFileActionButtonFocus;
