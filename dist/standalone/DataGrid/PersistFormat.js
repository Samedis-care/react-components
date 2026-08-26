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
 * to half-entered filters.
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
 * Reduces the column state to what deviates from the defaults
 * @param columnState The current column state
 * @param defaultColumnState The column state the grid would start out with
 */
const encodeColumnStateDiff = (columnState, defaultColumnState) => {
    const sort = {};
    const filter = {};
    for (const field in columnState) {
        const entry = columnState[field];
        if (!isPlainObject(entry))
            continue;
        const def = defaultColumnState[field];
        const entrySort = entry.sort || 0;
        const defSort = def?.sort || 0;
        // sortOrder is meaningless while the column isn't sorted
        const entryOrder = entrySort === 0 ? undefined : entry.sortOrder;
        const defOrder = defSort === 0 ? undefined : def?.sortOrder;
        if (entrySort !== defSort || entryOrder !== defOrder) {
            sort[field] = entryOrder == null ? [entrySort] : [entrySort, entryOrder];
        }
        const entryFilter = normalizeFilterDef(entry.filter) ?? null;
        const defFilter = normalizeFilterDef(def?.filter) ?? null;
        if (!deepEqual(entryFilter, defFilter, "equals")) {
            filter[field] = entryFilter;
        }
    }
    return [sort, filter];
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
    if (cfg.includes("sort") || cfg.includes("filters")) {
        const [sort, filter] = encodeColumnStateDiff(columnState, defaultColumnState);
        if (cfg.includes("sort") && Object.keys(sort).length)
            result.sort = sort;
        if (cfg.includes("filters") && Object.keys(filter).length)
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
 * @param legacy The legacy data
 * @param defaultColumnState The column state the grid would start out with
 */
const migrateLegacyPersistedState = (legacy, defaultColumnState) => {
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
    const [sort, filter] = encodeColumnStateDiff(columnState, defaultColumnState);
    if (Object.keys(sort).length)
        result.sort = sort;
    if (Object.keys(filter).length)
        result.filter = filter;
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
const decode = (persisted, columns, defaultColumnState, config) => {
    const cfg = config ?? DEFAULT_PERSIST_CONFIG;
    const result = getDecodedDefaults(columns, defaultColumnState);
    const { columnHidden, columnPinned } = result.state;
    const data = isLegacy(persisted)
        ? migrateLegacyPersistedState(persisted, defaultColumnState)
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
        const sort = asRecord(data.sort);
        for (const field in sort) {
            // sort of a column which no longer exists would be sent to the backend
            if (!(field in result.columnState))
                continue;
            const entry = asPersistedSort(sort[field]);
            if (!entry)
                continue;
            const [direction, order] = entry;
            result.columnState[field] = {
                ...result.columnState[field],
                sort: direction,
                sortOrder: direction === 0 ? undefined : order,
            };
        }
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
 * Merges persisted data which was stored in separate places back together
 * @param parts The parts, in the order they should be merged
 * @see splitPersistedState
 */
export const mergePersistedState = (parts) => {
    let result;
    for (const part of parts) {
        if (!part)
            continue;
        if (!result) {
            result = { ...part };
            continue;
        }
        // legacy data nests half of the split under state, so a plain merge would
        // drop whatever the earlier part had in there
        const legacyState = {
            ...(isLegacy(result) ? result.state : undefined),
            ...(isLegacy(part) ? part.state : undefined),
        };
        result = { ...result, ...part };
        if (isLegacy(result) && Object.keys(legacyState).length)
            result.state = legacyState;
    }
    return result;
};
