import type { IFilterDef } from "./Content/FilterEntry";
import type { DataGridCustomDataType, DataGridProps, IDataGridColumnDef, IDataGridColumnsState, IDataGridState } from "./DataGrid";
/**
 * Version of the persisted format written by this library.
 * Bump this whenever the encoding changes in a way decode has to tell apart.
 *
 * Data with a higher `v` was written by a newer library version (a tab of a
 * later release, the release before a rollback). It is read with this
 * version's rules, as far as they get, and stays stored as it is until the
 * grid's state changes; the first auto-fit of the column widths does not
 * count. See DataGridPersistentStateContextType.
 * @remarks Data without a version is the legacy format, see decodePersistedState
 */
export declare const DATA_GRID_PERSIST_VERSION = 2;
export declare const DEFAULT_PERSIST_CONFIG: NonNullable<DataGridProps["persist"]>;
/**
 * The persisted sort of a single column: [direction, order], in the sort
 * record of earlier versions (see DataGridPersistentState.sort)
 * @remarks A direction of 0 records that the user cleared a sort which is active
 *          by default (see DataGridProps.defaultSort). Columns which are unsorted
 *          by default and unsorted by the user aren't written at all.
 */
export type DataGridPersistedSort = [direction: -1 | 0 | 1, order?: number];
/**
 * A grid's whole sort as persisted: the sorted columns as [field, direction],
 * highest priority first. Empty when nothing is sorted.
 */
export type DataGridPersistedSortList = [field: string, direction: -1 | 1][];
/**
 * A grid's whole column filters as persisted: the filtered columns as
 * [field, filter], each filter without its conditions that carry no value
 * (see normalizeFilterDef). Empty when no column is filtered.
 */
export type DataGridPersistedFilterList = [field: string, filter: IFilterDef][];
/**
 * The persisted (wire) format of the DataGrid state.
 *
 * This is deliberately not the shape of the runtime state: it is stored per user
 * on a server, so apart from the sort and the column filters it only carries
 * what deviates from the defaults. Keys are kept
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
     * The sort, as a whole (DataGridPersistedSortList). It is what the grid
     * opens with: DataGridProps.defaultSort only applies when nothing is
     * stored, and on a reset, so a default sort added or changed later leaves
     * it as it is. The sort of a column which is not currently defined is
     * dropped on read.
     * @remarks Data of earlier versions holds a record instead (field ->
     *          DataGridPersistedSort) with only the columns whose sort deviated
     *          from the default sort of that time. It is read on top of the
     *          current default sort, except for the default sorts that cannot
     *          have been in place when it was written: a default sort of a
     *          column without an entry, with the priority of a stored one.
     */
    sort?: DataGridPersistedSortList | Record<string, DataGridPersistedSort>;
    /**
     * The column filters, as a whole (DataGridPersistedFilterList). They are
     * what the grid opens with: DataGridProps.defaultFilter only applies when
     * nothing is stored, and on a reset, so a default filter added or changed
     * later leaves them as they are. The filter of a column which is not
     * currently defined is dropped on read.
     * @remarks Data of earlier versions holds a record instead (field ->
     *          filter) with only the columns whose filter was another
     *          condition than the default filter of that time (see
     *          isSameFilterDef), null for a default filter the user cleared,
     *          and no key at all when every column had its default filter. It
     *          is read on top of the current default filters.
     */
    filter?: DataGridPersistedFilterList | Record<string, IFilterDef | null>;
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
 * The runtime pieces decodePersistedState produces. Only the parts the config
 * passed to it names (DataGridProps.persist) are read from the persisted data,
 * the others are at their defaults.
 */
export interface DataGridDecodedState {
    /**
     * Per column field, whether the column is hidden and whether it is pinned:
     * as stored for the columns the user has seen, from the column definition
     * for the others. The search, the custom data and initialResize are only
     * there when they are stored.
     */
    state: Pick<IDataGridState, "columnHidden" | "columnPinned"> & Partial<Pick<IDataGridState, "search" | "customData" | "initialResize">>;
    /**
     * Per column field of the default column state passed in, its sort and
     * filter: as stored (see DataGridPersistentState.sort and .filter), else
     * as in the default column state
     */
    columnState: IDataGridColumnsState;
    /**
     * Per column field, the stored width in px. A column without a stored
     * width has no entry.
     */
    columnWidth: Record<string, number>;
}
/**
 * Drops filter entries which carry no value, as those have no effect on the
 * query. Used to keep the refresh trigger and the persisted data from reacting
 * to half-entered filters, and to build the column filters of the query
 * (dataGridPrepareFiltersAndSorts), so the query holds exactly the filters the
 * refresh trigger compares.
 * @param filter The filter to normalize
 * @returns The normalized filter, or undefined if it has no effect at all
 */
export declare const normalizeFilterDef: (filter: IFilterDef | null | undefined) => IFilterDef | undefined;
/**
 * Whether two filters are the same condition. Only the conditions carrying a
 * value count (see normalizeFilterDef), and the spellings of one condition are
 * equal: a key set to undefined and a missing one, a missing value2 and "", a
 * missing nextFilterType and "and" (as the filter popup reads it), and any
 * nextFilterType of a condition without a nextFilter, which combines nothing.
 * Keys IFilterDef does not define are not compared. The filter popup emits
 * a filter in its own spelling, also when the user empties it or ends on the
 * condition they started with, e.g. a default filter.
 * @param a The one filter
 * @param b The other filter
 * @returns true if both are the same condition, or both are no filter
 */
export declare const isSameFilterDef: (a: IFilterDef | null | undefined, b: IFilterDef | null | undefined) => boolean;
/**
 * Encodes the runtime state into the format we persist
 * @param state The grid state
 * @param columnState The column state (sort and filter)
 * @param columnWidth The column widths
 * @param columns The column definitions
 * @param config What to persist (DataGridProps.persist)
 */
export declare const encodePersistedState: (state: IDataGridState, columnState: IDataGridColumnsState, columnWidth: Record<string, number>, columns: IDataGridColumnDef[], config: DataGridProps["persist"]) => DataGridPersistentState;
/**
 * Was the data written by a newer library version, in a format this version
 * does not know (a `v` higher than DATA_GRID_PERSIST_VERSION)?
 * @param data The persisted data, as a provider hands it out
 */
export declare const isNewerPersistedState: (data: DataGridPersistedData | undefined) => boolean;
/**
 * Adds the parts of the state that a grid does not persist (those
 * DataGridProps.persist leaves out) to the data it persists, as they are
 * stored: a grid leaves what is stored for them as it is.
 *
 * Legacy data is migrated to the current format first. Data in a newer
 * format (see isNewerPersistedState) gives nothing: this version cannot tell
 * where that format keeps a part.
 * @param data The data the grid persists (encodePersistedState)
 * @param stored The persisted data, as the persistence provider hands it out
 * @param config What the grid persists (DataGridProps.persist)
 * @returns A new object with the stored parts which the config leaves out,
 *          or data itself when there is nothing to add
 */
export declare const keepStoredParts: (data: DataGridPersistentState, stored: DataGridPersistedData | undefined, config: DataGridProps["persist"]) => DataGridPersistentState;
/**
 * Decodes persisted data into the runtime state pieces, applying the column
 * definition defaults to every column this user hasn't seen before.
 *
 * Persisted data is whatever is in the user's storage, so this never throws: a
 * payload it can't make sense of falls back to the column definition defaults.
 * Data of a newer format (see isNewerPersistedState) is read with the rules of
 * this version: what is stored where this version looks.
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
 * Merges persisted data which was stored in separate places back together.
 *
 * Each part is read in its own format: a part is rewritten in the current
 * format only when it is written, so the parts may be in different formats.
 * Then every legacy part is migrated on its own, and the result is in the
 * current format, with the highest `v` of the parts stored in it, so data of
 * a newer format next to data of this one is not taken for this one's. A
 * migrated part has the whole sort and the whole column filters, as the
 * legacy format stored the whole state, not deviations from the defaults.
 * @param parts The parts, in the order they should be merged (a later part's
 *        keys win). Missing parts (undefined, null) are skipped.
 * @returns The merged data, undefined when no part is there. It is in the
 *          legacy format only when every part is.
 * @see splitPersistedState
 */
export declare const mergePersistedState: (parts: (DataGridPersistedData | undefined)[]) => DataGridPersistedData | undefined;
