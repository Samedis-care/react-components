import React from "react";
/**
 * Theme style slots of {@link FormAutoSave}
 * (`components.CcFormAutoSave.styleOverrides.<slot>`), also the keys of its `classes`
 * prop:
 * - `root`: the status region (`role="status"`) whose text is the outcome of the last
 *   auto-save. Visually hidden, unless `showStatus` is set: then it has the class
 *   `CcFormAutoSave-visible` and is a line of the theme's `typography.caption` in
 *   `palette.text.secondary`, one line high also while it is empty. While it has a
 *   text, it has the class of its status: `CcFormAutoSave-saving`,
 *   `CcFormAutoSave-saved` or `CcFormAutoSave-failed`; the failed one is
 *   `palette.error.main`
 *
 * No slot receives an `ownerState`, and the root receives none of the props: theme
 * `variants` match nothing, style the states with their classes
 * (`root: { "&.CcFormAutoSave-saved": { … } }`).
 */
export type FormAutoSaveClassKey = "root";
export interface FormAutoSaveProps {
    /**
     * Milliseconds without a change of the values before the form is saved. A wait that
     * ends while the form is busy starts over once it is idle again.
     * @default 5000; 0 saves on every change, without waiting (once the form is idle)
     */
    debounceTime?: number;
    /**
     * Shows the status on screen, as a caption line where FormAutoSave is placed: "Saving…"
     * while an auto-save runs, "Saved" once it is done, "Could not save" when it failed.
     * Without it, the status is visually hidden and only read out by screen readers, and
     * FormAutoSave takes no room in the layout.
     * @default false
     */
    showStatus?: boolean;
    /**
     * Class name added to the status region (the root, with `classes.root`)
     * @default undefined (none)
     */
    className?: string;
    /**
     * Class names added to the slots, by slot (see {@link FormAutoSaveClassKey})
     * @default undefined (none)
     */
    classes?: Partial<Record<FormAutoSaveClassKey, string>>;
}
declare const _default: React.MemoExoticComponent<(inProps: FormAutoSaveProps) => React.JSX.Element>;
export default _default;
