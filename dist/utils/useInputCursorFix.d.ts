import React from "react";
export interface InputCursorFixHook {
    /**
     * to be called in the inputs onChange handler
     * @param event The on change event
     */
    handleCursorChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    /**
     * Has to be passed to the input ref prop
     */
    cursorInputRef: React.RefObject<HTMLInputElement | null>;
}
/**
 * React hook to fix the cursor reset bug for controlled inputs which auto-format values
 * @param newValue The currently passed value (passed to input)
 */
declare const useInputCursorFix: (newValue: string) => InputCursorFixHook;
export default useInputCursorFix;
