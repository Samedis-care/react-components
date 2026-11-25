import React from "react";
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
declare const useFileActionButtonFocus: (fallbackRef?: React.RefObject<HTMLElement | null>) => ((index: number) => React.RefCallback<HTMLButtonElement>);
export default useFileActionButtonFocus;
