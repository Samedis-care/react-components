import React, { useContext, useMemo } from "react";
import { FormContext } from "./Form";
import {
	DirtyStateContext,
	DirtyStateMarks,
	NO_DIRTY_STATE,
} from "./DirtyStateContext";

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
	marks:
		DirtyStateMarks | ((formDirtyFields: DirtyStateMarks) => DirtyStateMarks);
	/**
	 * The fields to apply the marks to
	 */
	children?: React.ReactNode;
}

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
const DirtyStateProvider = (props: DirtyStateProviderProps) => {
	const { marks, children } = props;
	// not useFormContext(): a provider is allowed outside a form, where there is no form
	// dirty state to offer and the marks can only come from the application
	const formContext = useContext(FormContext);
	const formDirtyFields = formContext?.dirtyFields ?? NO_DIRTY_STATE;
	const value = useMemo(
		() => (typeof marks === "function" ? marks(formDirtyFields) : marks),
		[marks, formDirtyFields],
	);
	return (
		<DirtyStateContext.Provider value={value}>
			{children}
		</DirtyStateContext.Provider>
	);
};

export default React.memo(DirtyStateProvider);
