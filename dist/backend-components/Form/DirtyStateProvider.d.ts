import React from "react";
import { DirtyStateMarks } from "./DirtyStateContext";
export interface DirtyStateProviderProps {
    /**
     * The fields to display the modified marker on
     * @param formDirtyFields What the form engine computed, i.e.
     *                        `FormContextData.dirtyFields` — an empty object outside a form.
     *                        Take it to add to the form's own dirty state, ignore it to
     *                        replace it.
     * @remarks Memoize this, or pass a function declared outside the render: a new value
     *          re-renders every field below.
     */
    marks: DirtyStateMarks | ((formDirtyFields: DirtyStateMarks) => DirtyStateMarks);
    /**
     * The fields to apply the marks to
     */
    children?: React.ReactNode;
}
declare const _default: React.MemoExoticComponent<(props: DirtyStateProviderProps) => React.JSX.Element>;
export default _default;
