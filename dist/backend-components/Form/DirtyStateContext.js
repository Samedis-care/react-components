import React, { useContext } from "react";
/**
 * Nothing is marked
 * @remarks Shared and frozen, so every provider handing out "no marks" hands out the same
 *          value and consumers don't re-render for it
 */
export const NO_DIRTY_STATE = Object.freeze({});
/**
 * The fields which display the modified marker
 *
 * @remarks This is display state, not fact. `FormContextData.dirtyFields` is what the form
 * engine computed; this is what the controls are told to show, and the two are deliberately
 * separate — an application can mark a field that matches the server-side value, which a
 * change request workflow needs: the proposed record is saved, so the form isn't dirty, but
 * the fields it changes still have to stand out.
 *
 * Nothing is marked unless asked for. `Form` always sets this — to its own dirtyFields with
 * `FormProps.showDirtyState`, and to {@link NO_DIRTY_STATE} without — which is also what
 * keeps a nested form from inheriting the marks of the form around it.
 *
 * Read it with {@link useDirtyState}, override it for a subtree with `DirtyStateProvider`.
 */
export const DirtyStateContext = React.createContext(NO_DIRTY_STATE);
export function useDirtyState(field) {
    const marks = useContext(DirtyStateContext);
    return field === undefined ? marks : (marks[field] ?? false);
}
