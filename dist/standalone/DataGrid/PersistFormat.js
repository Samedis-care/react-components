import deepEqual from "../../utils/deepEqual";
import isPlainObject from "../../utils/isPlainObject";
/**
 * Version of the persisted format written by this library.
 * Bump this whenever the encoding changes in a way decode has to tell apart.
 * @remarks Data without a version is the legacy format, see decodePersistedState
 */
export const DATA_GRID_PERSIST_VERSION = 2;
// when you change this, also update documentation DataGridProps.persist @default
export const DEFAULT_PERSIST_CONFIG = [
    "columns",
    "sort",
    "filters",
];
/**
 * How many filters we follow down a nextFilter chain. Persisted data is user
 * controlled, so this is a guard against a runaway chain, not a real limit.
 */
const MAX_FILTER_CHAIN = 512;
/**
 * Drops filter entries which carry no value, as those have no effect on the
 * query. Used to keep the refresh trigger and the persisted data from reacting
 * to half-entered filters, and to build the column filters of the query
 * (dataGridPrepareFiltersAndSorts), so the query holds exactly the filters the
 * refresh trigger compares.
 * @param filter The filter to normalize
 * @returns The normalized filter, or undefined if it has no effect at all
 */
export const normalizeFilterDef = (filter) => {
    if (!filter?.value1)
        return undefined;
    // walk the chain first so we know where (and whether) to cut it
    const chain = [filter];
    let current = filter;
    while (chain.length < MAX_FILTER_CHAIN) {
        const next = current.nextFilter;
        if (!next?.value1)
            break;
        chain.push(next);
        current = next;
    }
    // nothing to cut, the chain is already exactly the filters carrying a value
    if (current.nextFilter === undefined)
        return filter;
    let result = { ...current, nextFilter: undefined };
    for (let i = chain.length - 2; i >= 0; i--) {
        result = { ...chain[i], nextFilter: result };
    }
    return result;
};
/**
 * Persisted data is whatever sits in a user's storage - it may have been written
 * by an older version, hand edited, or truncated. Everything coming out of it
 * goes through these, and anything unexpected is treated as not stored at all.
 */
const asFieldList = (value) => Array.isArray(value)
    ? value.filter((entry) => typeof entry === "string")
    : [];
const asRecord = (value) => isPlainObject(value) ? value : {};
const asPersistedSort = (value) => {
    if (!Array.isArray(value))
        return undefined;
    const [direction, order] = value;
    if (direction !== -1 && direction !== 0 && direction !== 1)
        return undefined;
    return typeof order === "number" && Number.isFinite(order)
        ? [direction, order]
        : [direction];
};
const asSortList = (value) => value.filter((entry) => Array.isArray(entry) &&
    typeof entry[0] === "string" &&
    (entry[1] === -1 || entry[1] === 1));
const asFilterDef = (value, depth = 0) => {
    if (depth >= MAX_FILTER_CHAIN)
        return undefined;
    if (!isPlainObject(value))
        return undefined;
    if (typeof value.value1 !== "string")
        return undefined;
    // FilterType allows null, so only a wrong kind of value disqualifies it
    if (typeof value.type !== "string" && value.type !== null)
        return undefined;
    return normalizeFilterDef({
        ...value,
        value2: typeof value.value2 === "string" ? value.value2 : "",
        nextFilter: asFilterDef(value.nextFilter, depth + 1),
    });
};
const asWidths = (value) => {
    const result = {};
    const record = asRecord(value);
    for (const field in record) {
        const width = record[field];
        if (typeof width === "number" && Number.isFinite(width) && width > 0)
            result[field] = width;
    }
    return result;
};
/**
 * The sorted columns of a column state, highest priority (lowest sortOrder)
 * first; a sorted column without a sortOrder comes last
 * @param columnState The column state
 */
const encodeSort = (columnState) => Object.entries(columnState)
    .filter((entry) => isPlainObject(entry[1]) &&
    (entry[1].sort === -1 || entry[1].sort === 1))
    .sort(([, a], [, b]) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
    (b.sortOrder ?? Number.MAX_SAFE_INTEGER))
    .map(([field, entry]) => [field, entry.sort]);
/**
 * Reduces the column filters to what deviates from the defaults
 * @param columnState The current column state
 * @param defaultColumnState The column state the grid would start out with
 */
const encodeFilterDiff = (columnState, defaultColumnState) => {
    const filter = {};
    for (const field in columnState) {
        const entry = columnState[field];
        if (!isPlainObject(entry))
            continue;
        const def = defaultColumnState[field];
        const entryFilter = normalizeFilterDef(entry.filter) ?? null;
        const defFilter = normalizeFilterDef(def?.filter) ?? null;
        if (!deepEqual(entryFilter, defFilter, "equals")) {
            filter[field] = entryFilter;
        }
    }
    return filter;
};
/**
 * Encodes the runtime state into the format we persist
 * @param state The grid state
 * @param columnState The column state (sort and filter)
 * @param columnWidth The column widths
 * @param defaultColumnState The column state the grid would start out with
 * @param columns The column definitions
 * @param config What to persist (DataGridProps.persist)
 */
export const encodePersistedState = (state, columnState, columnWidth, defaultColumnState, columns, config) => {
    const cfg = config ?? DEFAULT_PERSIST_CONFIG;
    const result = { v: DATA_GRID_PERSIST_VERSION };
    if (cfg.includes("columns")) {
        const shown = [];
        const hidden = [];
        for (const field in state.columnHidden) {
            (state.columnHidden[field] ? hidden : shown).push(field);
        }
        const forcePinned = new Set(columns.filter((column) => column.forcePin).map((column) => column.field));
        const pinned = [];
        for (const field in state.columnPinned) {
            // forced pins come back from the column definition, no need to store them
            if (state.columnPinned[field] && !forcePinned.has(field))
                pinned.push(field);
        }
        if (shown.length)
            result.shown = shown;
        if (hidden.length)
            result.hidden = hidden;
        if (pinned.length)
            result.pinned = pinned;
        // widths are measured, so they come out fractional - a px is plenty
        const width = {};
        for (const field in columnWidth) {
            const rounded = Math.round(columnWidth[field]);
            if (Number.isFinite(rounded))
                width[field] = rounded;
        }
        result.width = width;
        result.initialResize = state.initialResize;
    }
    // the whole sort, also when it is the default one: a default sort changed
    // later must not change what the user has
    if (cfg.includes("sort"))
        result.sort = encodeSort(columnState);
    if (cfg.includes("filters")) {
        const filter = encodeFilterDiff(columnState, defaultColumnState);
        if (Object.keys(filter).length)
            result.filter = filter;
    }
    if (cfg.includes("filters")) {
        // the default search is always empty, so omitting it is lossless
        if (state.search)
            result.search = state.search;
        // custom data is consumer defined, we can't tell a deviation from a default
        result.customData = state.customData;
    }
    return result;
};
const isLegacy = (data) => data.v == null;
/**
 * Brings the legacy format into the current one.
 *
 * The interesting part is the set of columns the user has already seen, which
 * legacy data doesn't record. The legacy columnState carries an entry for every
 * column the grid rendered, so its keys (plus whatever the visibility arrays
 * mention) are exactly that set.
 *
 * The legacy columnState is the whole sort and filter state, not a deviation
 * from the defaults: its sort becomes the whole sort, and every column in it
 * gets a filter entry (an unfiltered one null). Applied to whatever the
 * defaults are when it is read, that gives back exactly the legacy state, so
 * the migration needs no defaults and a part of the data can be migrated on
 * its own (see mergePersistedState).
 * @param legacy The legacy data
 */
const migrateLegacyPersistedState = (legacy) => {
    const columnState = asRecord(legacy.columnState);
    const state = asRecord(legacy.state);
    const result = { v: DATA_GRID_PERSIST_VERSION };
    const hiddenColumns = asFieldList(state.hiddenColumns);
    const lockedColumns = asFieldList(state.lockedColumns);
    if (state.hiddenColumns != null || state.lockedColumns != null) {
        const known = [
            ...new Set([
                ...Object.keys(columnState),
                ...hiddenColumns,
                ...lockedColumns,
            ]),
        ];
        // an empty known set tells us nothing - leaving shown/hidden off means
        // every column keeps its default rather than being hidden retroactively
        if (known.length) {
            result.shown = known.filter((field) => !hiddenColumns.includes(field));
            result.hidden = known.filter((field) => hiddenColumns.includes(field));
            result.pinned = known.filter((field) => lockedColumns.includes(field));
        }
    }
    const filter = {};
    for (const field in columnState) {
        const entry = columnState[field];
        if (!isPlainObject(entry))
            continue;
        filter[field] = normalizeFilterDef(entry.filter) ?? null;
    }
    // a column state without a usable entry says nothing about the sort
    if (Object.keys(filter).length) {
        result.sort = encodeSort(columnState);
        result.filter = filter;
    }
    if (typeof state.search === "string" && state.search)
        result.search = state.search;
    if (isPlainObject(state.customData))
        result.customData = state.customData;
    const width = asWidths(legacy.columnWidth);
    if (Object.keys(width).length)
        result.width = width;
    if (typeof state.initialResize === "boolean")
        result.initialResize = state.initialResize;
    return result;
};
/**
 * The runtime state a grid starts out with when nothing was persisted
 * @param columns The column definitions
 * @param defaultColumnState The column state the grid would start out with
 */
const getDecodedDefaults = (columns, defaultColumnState) => {
    const columnHidden = {};
    const columnPinned = {};
    for (const column of columns) {
        columnHidden[column.field] = !!column.hidden;
        columnPinned[column.field] = !!(column.pinned || column.forcePin);
    }
    return {
        state: { columnHidden, columnPinned },
        // own every entry - callers mutate them in place (overrideFilter in
        // DataGrid does) and the defaults handed in here are memoized upstream
        columnState: Object.fromEntries(Object.entries(defaultColumnState).map(([field, entry]) => [
            field,
            { ...entry },
        ])),
        columnWidth: {},
    };
};
/**
 * Applies a stored whole sort (DataGridPersistedSortList): the default sort
 * doesn't apply
 * @param columnState The column state to change, starting with the defaults
 * @param list The stored list
 */
const applySortList = (columnState, list) => {
    for (const field in columnState) {
        columnState[field] = {
            ...columnState[field],
            sort: 0,
            sortOrder: undefined,
        };
    }
    let priority = 0;
    for (const [field, direction] of asSortList(list)) {
        // sort of a column which no longer exists would be sent to the backend
        if (!Object.prototype.hasOwnProperty.call(columnState, field))
            continue;
        // a column listed twice keeps its first entry
        if (columnState[field].sort !== 0)
            continue;
        columnState[field] = {
            ...columnState[field],
            sort: direction,
            sortOrder: ++priority,
        };
    }
};
/**
 * Applies a stored sort record, as written before the sort was stored as a
 * whole: the columns whose sort deviated from the default sort of that time
 * @param columnState The column state to change, starting with the defaults
 * @param record The stored record
 */
const applySortRecord = (columnState, record) => {
    const sort = new Map();
    for (const [field, value] of Object.entries(asRecord(record))) {
        const entry = asPersistedSort(value);
        if (entry)
            sort.set(field, entry);
    }
    // a stored sort and a default sort of a column without an entry which
    // share a priority were not both in place when the record was written:
    // that default sort was added or changed since, and doesn't apply
    const storedOrders = new Set();
    for (const [direction, order] of sort.values()) {
        if (direction !== 0 && order != null)
            storedOrders.add(order);
    }
    const defaultChanged = Object.entries(columnState).some(([field, entry]) => !sort.has(field) &&
        entry.sort !== 0 &&
        entry.sortOrder != null &&
        storedOrders.has(entry.sortOrder));
    if (defaultChanged) {
        for (const field in columnState) {
            if (sort.has(field))
                continue;
            columnState[field] = {
                ...columnState[field],
                sort: 0,
                sortOrder: undefined,
            };
        }
    }
    for (const [field, [direction, order]] of sort) {
        // sort of a column which no longer exists would be sent to the backend
        if (!(field in columnState))
            continue;
        columnState[field] = {
            ...columnState[field],
            sort: direction,
            sortOrder: direction === 0 ? undefined : order,
        };
    }
    // the record may leave gaps in the priorities, or none at all: number the
    // sorted columns 1..n, as the grid does
    let priority = 0;
    for (const [field] of encodeSort(columnState)) {
        columnState[field] = { ...columnState[field], sortOrder: ++priority };
    }
};
const decode = (persisted, columns, defaultColumnState, config) => {
    const cfg = config ?? DEFAULT_PERSIST_CONFIG;
    const result = getDecodedDefaults(columns, defaultColumnState);
    const { columnHidden, columnPinned } = result.state;
    const data = isLegacy(persisted)
        ? migrateLegacyPersistedState(persisted)
        : persisted;
    if (cfg.includes("columns")) {
        const shown = asFieldList(data.shown);
        const hidden = asFieldList(data.hidden);
        if (shown.length || hidden.length) {
            const pinned = asFieldList(data.pinned);
            // entries for columns which aren't currently defined are kept: a column
            // gated behind a permission must not look new once it comes back
            for (const field of shown)
                columnHidden[field] = false;
            for (const field of hidden)
                columnHidden[field] = true;
            for (const field of [...shown, ...hidden]) {
                columnPinned[field] = pinned.includes(field);
            }
            for (const column of columns) {
                if (column.forcePin)
                    columnPinned[column.field] = true;
            }
        }
        result.columnWidth = asWidths(data.width);
        if (typeof data.initialResize === "boolean")
            result.state.initialResize = data.initialResize;
    }
    if (cfg.includes("sort")) {
        if (Array.isArray(data.sort))
            applySortList(result.columnState, data.sort);
        else
            applySortRecord(result.columnState, data.sort);
    }
    if (cfg.includes("filters")) {
        const filter = asRecord(data.filter);
        for (const field in filter) {
            // see above, a filter for a gone column would reach the backend
            if (!(field in result.columnState))
                continue;
            // null is a deliberately cleared default, anything unusable is skipped
            const value = filter[field];
            if (value !== null && !isPlainObject(value))
                continue;
            result.columnState[field] = {
                ...result.columnState[field],
                filter: value === null ? undefined : asFilterDef(value),
            };
        }
        if (typeof data.search === "string")
            result.state.search = data.search;
        if (isPlainObject(data.customData))
            result.state.customData = data.customData;
    }
    return result;
};
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
export const decodePersistedState = (persisted, columns, defaultColumnState, config) => {
    if (!persisted || typeof persisted !== "object")
        return getDecodedDefaults(columns, defaultColumnState);
    try {
        return decode(persisted, columns, defaultColumnState, config);
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error("[Components-Care] Failed decoding persisted DataGrid state, falling back to the defaults", persisted, e);
        return getDecodedDefaults(columns, defaultColumnState);
    }
};
/**
 * Splits the persisted data into the sizing part (belongs into fast, local
 * storage) and everything else (belongs into shared, server side storage)
 * @param data The data to split
 */
export const splitPersistedState = (data) => {
    const { width, initialResize, ...rest } = data;
    return [{ v: data.v, width, initialResize }, rest];
};
/**
 * Merges persisted data which was stored in separate places back together.
 *
 * Each part is read in its own format: a part is rewritten in the current
 * format only when it is written, so the parts may be in different formats.
 * Then every legacy part is migrated on its own, and the result is in the
 * current format, with the `v` of the last part that was stored in it. A
 * migrated part has the whole sort and a filter entry for every column in its
 * legacy columnState, as the legacy format stored the whole state, not
 * deviations from the defaults.
 * @param parts The parts, in the order they should be merged (a later part's
 *        keys win). Missing parts (undefined, null) are skipped.
 * @returns The merged data, undefined when no part is there. It is in the
 *          legacy format only when every part is.
 * @see splitPersistedState
 */
export const mergePersistedState = (parts) => {
    const current = parts.filter((part) => !!part && !isLegacy(part));
    if (current.length) {
        let merged;
        for (const part of parts) {
            if (!part)
                continue;
            merged = {
                ...merged,
                ...(isLegacy(part) ? migrateLegacyPersistedState(part) : part),
            };
        }
        // the version of the parts stored in the current format, not the one
        // the migration of a legacy part put in
        return { ...merged, v: current[current.length - 1].v };
    }
    // every part is legacy data, which nests half of the split under state, so
    // a plain merge would drop whatever the earlier part had in there
    let result;
    for (const part of parts) {
        if (!part)
            continue;
        if (!result) {
            result = { ...part };
            continue;
        }
        const state = { ...result.state, ...part.state };
        result = { ...result, ...part };
        if (Object.keys(state).length)
            result.state = state;
    }
    return result;
};
