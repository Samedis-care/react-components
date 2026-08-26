import type { IFilterDef } from "./Content/FilterEntry";
import type { DataGridCustomDataType, DataGridProps, IDataGridColumnDef, IDataGridColumnsState, IDataGridState } from "./DataGrid";
/**
 * Version of the persisted format written by this library.
 * Bump this whenever the encoding changes in a way decode has to tell apart.
 * @remarks Data without a version is the legacy format, see decodePersistedState
 */
export declare const DATA_GRID_PERSIST_VERSION = 2;
export declare const DEFAULT_PERSIST_CONFIG: NonNullable<DataGridProps["persist"]>;
/**
 * The persisted sort of a single column: [direction, order]
 * @remarks A direction of 0 records that the user cleared a sort which is active
 *          by default (see DataGridProps.defaultSort). Columns which are unsorted
 *          by default and unsorted by the user aren't written at all.
 */
export type DataGridPersistedSort = [direction: -1 | 0 | 1, order?: number];
/**
 * The persisted (wire) format of the DataGrid state.
 *
 * This is deliberately not the shape of the runtime state: it is stored per user
 * on a server, so it only carries what deviates from the defaults. Keys are kept
 * short-ish and everything optional, which keeps a 70 column grid at well under
 * half the size of the legacy format.
 *
 * `shown` and `hidden` together are the set of columns the user has already seen.
 * A column in neither list is new to this user and keeps the visibility and pin
 * state from its column definition — that's the whole point of storing both lists
 * instead of only the hidden one.
 */
export interface DataGridPersistentState {
    /**
     * Format version, see DATA_GRID_PERSIST_VERSION
     */
    v: number;
    /**
     * Known columns which are visible
     */
    shown?: string[];
    /**
     * Known columns which are hidden
     */
    hidden?: string[];
    /**
     * Known columns which are pinned
     * @remarks Columns with forcePin set are omitted, they are re-applied on read
     */
    pinned?: string[];
    /**
     * Sort per column, only for columns which deviate from the default
     */
    sort?: Record<string, DataGridPersistedSort>;
    /**
     * Filter per column, only for columns which deviate from the default.
     * null records that the user cleared a filter which is set by default.
     */
    filter?: Record<string, IFilterDef | null>;
    /**
     * The quick filter (search) string, omitted when empty
     */
    search?: string;
    /**
     * Custom user-defined data
     */
    customData?: DataGridCustomDataType;
    /**
     * Column widths in px
     */
    width?: Record<string, number>;
    /**
     * Has the initial auto-fit of the column widths already run?
     */
    initialResize?: boolean;
}
/**
 * The format written by library versions before DATA_GRID_PERSIST_VERSION 2.
 * Only ever read, never written — see decodePersistedState.
 */
export interface DataGridPersistentStateLegacy {
    v?: undefined;
    columnState?: IDataGridColumnsState | null;
    columnWidth?: Record<string, number> | null;
    state?: {
        search?: string;
        hiddenColumns?: string[] | null;
        lockedColumns?: string[] | null;
        customData?: DataGridCustomDataType | null;
        initialResize?: boolean;
    } | null;
}
/**
 * Anything a persistence provider may hand us: either the current format or one
 * of the older ones still sitting in a user's storage.
 */
export type DataGridPersistedData = DataGridPersistentState | DataGridPersistentStateLegacy;
/**
 * The runtime pieces decodePersistedState produces
 */
export interface DataGridDecodedState {
    state: Pick<IDataGridState, "columnHidden" | "columnPinned"> & Partial<Pick<IDataGridState, "search" | "customData" | "initialResize">>;
    columnState: IDataGridColumnsState;
    columnWidth: Record<string, number>;
}
/**
 * Drops filter entries which carry no value, as those have no effect on the
 * query. Used to keep the refresh trigger and the persisted data from reacting
 * to half-entered filters.
 * @param filter The filter to normalize
 * @returns The normalized filter, or undefined if it has no effect at all
 */
export declare const normalizeFilterDef: (filter: IFilterDef | null | undefined) => IFilterDef | undefined;
/**
 * Encodes the runtime state into the format we persist
 * @param state The grid state
 * @param columnState The column state (sort and filter)
 * @param columnWidth The column widths
 * @param defaultColumnState The column state the grid would start out with
 * @param columns The column definitions
 * @param config What to persist (DataGridProps.persist)
 */
export declare const encodePersistedState: (state: IDataGridState, columnState: IDataGridColumnsState, columnWidth: Record<string, number>, defaultColumnState: IDataGridColumnsState, columns: IDataGridColumnDef[], config: DataGridProps["persist"]) => DataGridPersistentState;
/**
 * Decodes persisted data into the runtime state pieces, applying the column
 * definition defaults to every column this user hasn't seen before.
 *
 * Persisted data is whatever is in the user's storage, so this never throws: a
 * payload it can't make sense of falls back to the column definition defaults.
 * @param persisted The persisted data, in any format we ever wrote
 * @param columns The column definitions
 * @param defaultColumnState The column state the grid would start out with
 * @param config What to persist (DataGridProps.persist)
 */
export declare const decodePersistedState: (persisted: DataGridPersistedData | undefined, columns: IDataGridColumnDef[], defaultColumnState: IDataGridColumnsState, config: DataGridProps["persist"]) => DataGridDecodedState;
/**
 * Splits the persisted data into the sizing part (belongs into fast, local
 * storage) and everything else (belongs into shared, server side storage)
 * @param data The data to split
 */
export declare const splitPersistedState: (data: DataGridPersistentState) => [sizing: DataGridPersistentState, rest: DataGridPersistentState];
/**
 * Merges persisted data which was stored in separate places back together
 * @param parts The parts, in the order they should be merged
 * @see splitPersistedState
 */
export declare const mergePersistedState: (parts: (DataGridPersistedData | undefined)[]) => DataGridPersistedData | undefined;
