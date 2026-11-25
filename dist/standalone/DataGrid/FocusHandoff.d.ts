import React from "react";
/**
 * Where keyboard focus was in a grid that unmounted while it had focus
 */
export interface DataGridFocusHandoff {
    /**
     * The focused element's place below the grid's root element: per level,
     * its index among its parent's element children
     */
    path: number[];
    /**
     * The focused element's tag name
     */
    tagName: string;
    /**
     * The focused element's `role` attribute, or null without one
     */
    role: string | null;
    /**
     * The focused element's `type` attribute, or null without one
     */
    type: string | null;
    /**
     * The mount of the provider's children the grid belonged to
     * (DataGridFocusHandoffContextType.mount)
     */
    mount: unknown;
}
/**
 * What a persistence provider provides to hand keyboard focus over
 */
export interface DataGridFocusHandoffContextType {
    /**
     * Where focus was in a grid that unmounted, until a grid mounts in its
     * place and takes it over (null when there is nothing to hand over). The
     * same ref in every mount of the provider's children.
     */
    handoff: {
        current: DataGridFocusHandoff | null;
    };
    /**
     * Identifies the provider's current mount of its children (compared with
     * `===`): another value once the provider mounts them again for new storage
     * keys. A grid takes focus over from a grid of another mount only, not from
     * one that the app unmounted and shows again (CRUD's grid while a form is
     * open), which takes focus as it would without a provider.
     */
    mount: unknown;
}
/**
 * Hands keyboard focus from a grid to the grid mounted in its place. The
 * persistence providers provide it, as they mount their children again when
 * their storage keys change; outside of one (null), focus is not handed over.
 */
export declare const DataGridFocusHandoffContext: React.Context<DataGridFocusHandoffContextType | null>;
/**
 * Keeps keyboard focus in a grid that a persistence provider mounts again
 * (DataGridLocalStoragePersist, DataGridStorageManagerPersist, when their
 * storage keys change). When the grid unmounts while focus is inside it,
 * focus moves to the grid mounted in its place for the new keys: to the
 * element at the same place, if that is the same kind of element and takes
 * focus, or else to the grid's first element that does. Focus that is not on
 * the page body by then (it moved on meanwhile, or the new grid's own
 * `autoFocus` took it) stays where it is.
 *
 * Called by the component that renders the root element (DataGrid): the
 * layout effects of the elements inside it run before React sets its ref.
 * @param rootRef The grid's root element
 */
export declare const useDataGridFocusHandoff: (rootRef: React.RefObject<HTMLElement | null>) => void;
