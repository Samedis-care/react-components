import { useCallback } from "react";
/**
 * The keydown handler for the root of a text field that commits its edit on blur: Enter in
 * the field's input commits the edit too. A browser submits a form on Enter in its input
 * without a blur, so the form would get the value from before the edit. Enter that ends an
 * IME composition commits nothing, nor does Enter on a button in the field (the touch Clear).
 * @param commit Commits the edit; called with the keydown event, whose target is the input
 * @param onKeyDown The caller's keydown handler for the field's root; called after `commit`
 * @returns The handler to pass as the text field's `onKeyDown`
 */
const useCommitOnEnter = (commit, onKeyDown) => useCallback((event) => {
    if (event.key === "Enter" &&
        !event.nativeEvent.isComposing &&
        event.target instanceof HTMLInputElement) {
        commit(event);
    }
    onKeyDown?.(event);
}, [commit, onKeyDown]);
export default useCommitOnEnter;
