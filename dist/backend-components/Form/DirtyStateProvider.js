import { jsx as _jsx } from "react/jsx-runtime";
import React, { useContext, useMemo } from "react";
import { FormContext } from "./Form";
import { DirtyStateContext, NO_DIRTY_STATE, } from "./DirtyStateContext";
/**
 * Sets which fields display the modified marker, for everything below it
 *
 * @remarks Overrides `FormProps.showDirtyState` for its subtree. Where the marks are the
 * form's own dirty state this is not needed — that is what `showDirtyState` is. Use this
 * where the application knows better than the form engine does, e.g. a change request
 * workflow marking the fields a proposal touched, which are saved and therefore not dirty:
 *
 * ```tsx
 * const marks = useCallback(
 *   (formDirtyFields: DirtyStateMarks) =>
 *     Object.fromEntries(
 *       Object.keys(formDirtyFields).map((field) => [
 *         field,
 *         formDirtyFields[field] ||
 *           baselineRecord[field] !== proposedRecord[field],
 *       ]),
 *     ),
 *   [baselineRecord, proposedRecord],
 * );
 *
 * <DirtyStateProvider marks={marks}>{fields}</DirtyStateProvider>
 * ```
 *
 * The function is handed the form engine's own per-field dirty state, not the marks of an
 * enclosing provider. Read those with `useDirtyState()` if you need to build on them.
 */
const DirtyStateProvider = (props) => {
    const { marks, children } = props;
    // not useFormContext(): a provider is allowed outside a form, where there is no form
    // dirty state to offer and the marks can only come from the application
    const formContext = useContext(FormContext);
    const formDirtyFields = formContext?.dirtyFields ?? NO_DIRTY_STATE;
    const value = useMemo(() => (typeof marks === "function" ? marks(formDirtyFields) : marks), [marks, formDirtyFields]);
    return (_jsx(DirtyStateContext.Provider, { value: value, children: children }));
};
export default React.memo(DirtyStateProvider);
