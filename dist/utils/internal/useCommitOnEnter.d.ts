import React from "react";
/** A keydown event on a text field's root whose target is the field's input */
export type InputKeyDownEvent = React.KeyboardEvent<HTMLDivElement> & {
    target: HTMLInputElement;
};
/**
 * The keydown handler for the root of a text field that commits its edit on blur: Enter in
 * the field's input commits the edit too. A browser submits a form on Enter in its input
 * without a blur, so the form would get the value from before the edit. Enter that ends an
 * IME composition commits nothing, nor does Enter on a button in the field (the touch Clear).
 * @param commit Commits the edit; called with the keydown event, whose target is the input
 * @param onKeyDown The caller's keydown handler for the field's root; called after `commit`
 * @returns The handler to pass as the text field's `onKeyDown`
 */
declare const useCommitOnEnter: (commit: (event: InputKeyDownEvent) => void, onKeyDown: React.KeyboardEventHandler<HTMLDivElement> | undefined) => React.KeyboardEventHandler<HTMLDivElement>;
export default useCommitOnEnter;
