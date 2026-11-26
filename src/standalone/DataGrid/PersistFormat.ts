import type { IFilterDef } from "./Content/FilterEntry";
import type {
	DataGridCustomDataType,
	DataGridProps,
	IDataGridColumnDef,
	IDataGridColumnsState,
	IDataGridColumnState,
	IDataGridState,
} from "./DataGrid";
import isPlainObject from "../../utils/isPlainObject";

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
export const DATA_GRID_PERSIST_VERSION = 2;

// when you change this, also update documentation DataGridProps.persist @default
export const DEFAULT_PERSIST_CONFIG: NonNullable<DataGridProps["persist"]> = [
	"columns",
	"sort",
	"filters",
];

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
export type DataGridPersistedData =
	DataGridPersistentState | DataGridPersistentStateLegacy;

/**
 * The runtime pieces decodePersistedState produces
 */
export interface DataGridDecodedState {
	state: Pick<IDataGridState, "columnHidden" | "columnPinned"> &
		Partial<Pick<IDataGridState, "search" | "customData" | "initialResize">>;
	columnState: IDataGridColumnsState;
	columnWidth: Record<string, number>;
}

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
export const normalizeFilterDef = (
	filter: IFilterDef | null | undefined,
): IFilterDef | undefined => {
	if (!filter?.value1) return undefined;
	// walk the chain first so we know where (and whether) to cut it
	const chain: IFilterDef[] = [filter];
	let current = filter;
	while (chain.length < MAX_FILTER_CHAIN) {
		const next = current.nextFilter;
		if (!next?.value1) break;
		chain.push(next);
		current = next;
	}
	// nothing to cut, the chain is already exactly the filters carrying a value
	if (current.nextFilter === undefined) return filter;
	let result: IFilterDef | undefined = { ...current, nextFilter: undefined };
	for (let i = chain.length - 2; i >= 0; i--) {
		result = { ...chain[i], nextFilter: result };
	}
	return result;
};

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
export const isSameFilterDef = (
	a: IFilterDef | null | undefined,
	b: IFilterDef | null | undefined,
): boolean => {
	let left = normalizeFilterDef(a);
	let right = normalizeFilterDef(b);
	// normalizeFilterDef ends both chains within MAX_FILTER_CHAIN conditions
	while (left && right) {
		if (
			left.type !== right.type ||
			left.value1 !== right.value1 ||
			(left.value2 ?? "") !== (right.value2 ?? "")
		)
			return false;
		if (
			left.nextFilter &&
			right.nextFilter &&
			(left.nextFilterType ?? "and") !== (right.nextFilterType ?? "and")
		)
			return false;
		left = left.nextFilter;
		right = right.nextFilter;
	}
	return !left && !right;
};

/**
 * Persisted data is whatever sits in a user's storage - it may have been written
 * by an older version, hand edited, or truncated. Everything coming out of it
 * goes through these, and anything unexpected is treated as not stored at all.
 */
const asFieldList = (value: unknown): string[] =>
	Array.isArray(value)
		? value.filter((entry): entry is string => typeof entry === "string")
		: [];

const asRecord = (value: unknown): Record<string, unknown> =>
	isPlainObject(value) ? value : {};

const asPersistedSort = (value: unknown): DataGridPersistedSort | undefined => {
	if (!Array.isArray(value)) return undefined;
	const [direction, order] = value as unknown[];
	if (direction !== -1 && direction !== 0 && direction !== 1) return undefined;
	return typeof order === "number" && Number.isFinite(order)
		? [direction, order]
		: [direction];
};

const asSortList = (value: unknown[]): DataGridPersistedSortList =>
	value.filter(
		(entry): entry is [string, -1 | 1] =>
			Array.isArray(entry) &&
			typeof entry[0] === "string" &&
			(entry[1] === -1 || entry[1] === 1),
	);

const asFilterDef = (value: unknown, depth = 0): IFilterDef | undefined => {
	if (depth >= MAX_FILTER_CHAIN) return undefined;
	if (!isPlainObject(value)) return undefined;
	if (typeof value.value1 !== "string") return undefined;
	// FilterType allows null, so only a wrong kind of value disqualifies it
	if (typeof value.type !== "string" && value.type !== null) return undefined;
	return normalizeFilterDef({
		...value,
		value2: typeof value.value2 === "string" ? value.value2 : "",
		nextFilter: asFilterDef(value.nextFilter, depth + 1),
	} as IFilterDef);
};

const asWidths = (value: unknown): Record<string, number> => {
	const result: Record<string, number> = {};
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
const encodeSort = (
	columnState: Record<string, IDataGridColumnState | undefined>,
): DataGridPersistedSortList =>
	Object.entries(columnState)
		.filter(
			(entry): entry is [string, IDataGridColumnState] =>
				isPlainObject(entry[1]) &&
				(entry[1].sort === -1 || entry[1].sort === 1),
		)
		.sort(
			([, a], [, b]) =>
				(a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
				(b.sortOrder ?? Number.MAX_SAFE_INTEGER),
		)
		.map(([field, entry]) => [field, entry.sort as -1 | 1]);

/**
 * The filtered columns of a column state, each filter without its conditions
 * that carry no value (normalizeFilterDef)
 * @param columnState The column state
 */
const encodeFilter = (
	columnState: Record<string, IDataGridColumnState | undefined>,
): DataGridPersistedFilterList => {
	const list: DataGridPersistedFilterList = [];
	for (const [field, entry] of Object.entries(columnState)) {
		if (!isPlainObject(entry)) continue;
		const filter = normalizeFilterDef(entry.filter);
		if (filter) list.push([field, filter]);
	}
	return list;
};

/**
 * Encodes the runtime state into the format we persist
 * @param state The grid state
 * @param columnState The column state (sort and filter)
 * @param columnWidth The column widths
 * @param columns The column definitions
 * @param config What to persist (DataGridProps.persist)
 */
export const encodePersistedState = (
	state: IDataGridState,
	columnState: IDataGridColumnsState,
	columnWidth: Record<string, number>,
	columns: IDataGridColumnDef[],
	config: DataGridProps["persist"],
): DataGridPersistentState => {
	const cfg = config ?? DEFAULT_PERSIST_CONFIG;
	const result: DataGridPersistentState = { v: DATA_GRID_PERSIST_VERSION };

	if (cfg.includes("columns")) {
		const shown: string[] = [];
		const hidden: string[] = [];
		for (const field in state.columnHidden) {
			(state.columnHidden[field] ? hidden : shown).push(field);
		}
		const forcePinned = new Set(
			columns.filter((column) => column.forcePin).map((column) => column.field),
		);
		const pinned: string[] = [];
		for (const field in state.columnPinned) {
			// forced pins come back from the column definition, no need to store them
			if (state.columnPinned[field] && !forcePinned.has(field))
				pinned.push(field);
		}
		if (shown.length) result.shown = shown;
		if (hidden.length) result.hidden = hidden;
		if (pinned.length) result.pinned = pinned;
		// widths are measured, so they come out fractional - a px is plenty
		const width: Record<string, number> = {};
		for (const field in columnWidth) {
			const rounded = Math.round(columnWidth[field]);
			if (Number.isFinite(rounded)) width[field] = rounded;
		}
		result.width = width;
		result.initialResize = state.initialResize;
	}

	// the whole sort and filters, also when they are the default ones: a
	// default sort or filter changed later must not change what the user has
	if (cfg.includes("sort")) result.sort = encodeSort(columnState);

	if (cfg.includes("filters")) {
		result.filter = encodeFilter(columnState);
		// the default search is always empty, so omitting it is lossless
		if (state.search) result.search = state.search;
		// custom data is consumer defined, we can't tell a deviation from a default
		result.customData = state.customData;
	}

	return result;
};

const isLegacy = (
	data: DataGridPersistedData,
): data is DataGridPersistentStateLegacy => data.v == null;

/**
 * Was the data written by a newer library version, in a format this version
 * does not know (a `v` higher than DATA_GRID_PERSIST_VERSION)?
 * @param data The persisted data, as a provider hands it out
 */
export const isNewerPersistedState = (
	data: DataGridPersistedData | undefined,
): boolean => typeof data?.v === "number" && data.v > DATA_GRID_PERSIST_VERSION;

/**
 * Brings the legacy format into the current one.
 *
 * The interesting part is the set of columns the user has already seen, which
 * legacy data doesn't record. The legacy columnState carries an entry for every
 * column the grid rendered, so its keys (plus whatever the visibility arrays
 * mention) are exactly that set.
 *
 * The legacy columnState is the whole sort and filter state, not a deviation
 * from the defaults: it becomes the whole sort and the whole column filters.
 * They are read as they are, whatever the defaults are when they are read, so
 * the migration needs no defaults and a part of the data can be migrated on
 * its own (see mergePersistedState).
 * @param legacy The legacy data
 */
const migrateLegacyPersistedState = (
	legacy: DataGridPersistentStateLegacy,
): DataGridPersistentState => {
	const columnState = asRecord(legacy.columnState) as IDataGridColumnsState;
	const state = asRecord(legacy.state);
	const result: DataGridPersistentState = { v: DATA_GRID_PERSIST_VERSION };

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

	// a column state without a usable entry says nothing about the sort and
	// the filters
	if (Object.values(columnState).some((entry) => isPlainObject(entry))) {
		result.sort = encodeSort(columnState);
		result.filter = encodeFilter(columnState);
	}

	if (typeof state.search === "string" && state.search)
		result.search = state.search;
	if (isPlainObject(state.customData)) result.customData = state.customData;
	const width = asWidths(legacy.columnWidth);
	if (Object.keys(width).length) result.width = width;
	if (typeof state.initialResize === "boolean")
		result.initialResize = state.initialResize;

	return result;
};

/**
 * A part of the grid's state that DataGridProps.persist names
 */
type DataGridPersistPart = NonNullable<DataGridProps["persist"]>[number];

/**
 * The keys of the persisted format that hold each part
 */
const PERSIST_PART_KEYS: Record<
	DataGridPersistPart,
	(keyof DataGridPersistentState)[]
> = {
	columns: ["shown", "hidden", "pinned", "width", "initialResize"],
	sort: ["sort"],
	filters: ["filter", "search", "customData"],
};

/**
 * Sets a key of the target to the source's value
 * @param target The object to change
 * @param source The object to read
 * @param key The key
 */
const copyKey = <T, K extends keyof T>(target: T, source: T, key: K) => {
	target[key] = source[key];
};

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
export const keepStoredParts = (
	data: DataGridPersistentState,
	stored: DataGridPersistedData | undefined,
	config: DataGridProps["persist"],
): DataGridPersistentState => {
	const cfg = config ?? DEFAULT_PERSIST_CONFIG;
	const left = (Object.keys(PERSIST_PART_KEYS) as DataGridPersistPart[]).filter(
		(part) => !cfg.includes(part),
	);
	if (!left.length || !stored || typeof stored !== "object") return data;
	if (isNewerPersistedState(stored)) return data;
	const current = isLegacy(stored)
		? migrateLegacyPersistedState(stored)
		: stored;
	const result: DataGridPersistentState = { ...data };
	for (const part of left) {
		for (const key of PERSIST_PART_KEYS[part]) {
			if (current[key] !== undefined) copyKey(result, current, key);
		}
	}
	return result;
};

/**
 * The runtime state a grid starts out with when nothing was persisted
 * @param columns The column definitions
 * @param defaultColumnState The column state the grid would start out with
 */
const getDecodedDefaults = (
	columns: IDataGridColumnDef[],
	defaultColumnState: IDataGridColumnsState,
): DataGridDecodedState => {
	const columnHidden: Record<string, boolean> = {};
	const columnPinned: Record<string, boolean> = {};
	for (const column of columns) {
		columnHidden[column.field] = !!column.hidden;
		columnPinned[column.field] = !!(column.pinned || column.forcePin);
	}
	return {
		state: { columnHidden, columnPinned },
		// own every entry - callers mutate them in place (overrideFilter in
		// DataGrid does) and the defaults handed in here are memoized upstream
		columnState: Object.fromEntries(
			Object.entries(defaultColumnState).map(([field, entry]) => [
				field,
				{ ...entry },
			]),
		),
		columnWidth: {},
	};
};

/**
 * Applies a stored whole sort (DataGridPersistedSortList): the default sort
 * doesn't apply
 * @param columnState The column state to change, starting with the defaults
 * @param list The stored list
 */
const applySortList = (columnState: IDataGridColumnsState, list: unknown[]) => {
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
		if (!Object.prototype.hasOwnProperty.call(columnState, field)) continue;
		// a column listed twice keeps its first entry
		if (columnState[field].sort !== 0) continue;
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
const applySortRecord = (
	columnState: IDataGridColumnsState,
	record: unknown,
) => {
	const sort = new Map<string, DataGridPersistedSort>();
	for (const [field, value] of Object.entries(asRecord(record))) {
		const entry = asPersistedSort(value);
		if (entry) sort.set(field, entry);
	}
	// a stored sort and a default sort of a column without an entry which
	// share a priority were not both in place when the record was written:
	// that default sort was added or changed since, and doesn't apply
	const storedOrders = new Set<number>();
	for (const [direction, order] of sort.values()) {
		if (direction !== 0 && order != null) storedOrders.add(order);
	}
	const defaultChanged = Object.entries(columnState).some(
		([field, entry]) =>
			!sort.has(field) &&
			entry.sort !== 0 &&
			entry.sortOrder != null &&
			storedOrders.has(entry.sortOrder),
	);
	if (defaultChanged) {
		for (const field in columnState) {
			if (sort.has(field)) continue;
			columnState[field] = {
				...columnState[field],
				sort: 0,
				sortOrder: undefined,
			};
		}
	}
	for (const [field, [direction, order]] of sort) {
		// sort of a column which no longer exists would be sent to the backend.
		// Only own entries are columns: toString, __proto__ and the like are in
		// every object
		if (!Object.prototype.hasOwnProperty.call(columnState, field)) continue;
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

/**
 * Applies stored whole column filters (DataGridPersistedFilterList): the
 * default filters don't apply
 * @param columnState The column state to change, starting with the defaults
 * @param list The stored list
 */
const applyFilterList = (
	columnState: IDataGridColumnsState,
	list: unknown[],
) => {
	for (const field in columnState) {
		columnState[field] = { ...columnState[field], filter: undefined };
	}
	const listed = new Set<string>();
	for (const entry of list) {
		if (!Array.isArray(entry) || typeof entry[0] !== "string") continue;
		const [field, value] = entry as [string, unknown];
		// a filter for a column which no longer exists would reach the backend.
		// Only own entries are columns: toString, __proto__ and the like are in
		// every object
		if (!Object.prototype.hasOwnProperty.call(columnState, field)) continue;
		// a column listed twice keeps its first entry
		if (listed.has(field)) continue;
		listed.add(field);
		columnState[field] = { ...columnState[field], filter: asFilterDef(value) };
	}
};

/**
 * Applies a stored filter record, as written before the column filters were
 * stored as a whole: the columns whose filter deviated from the default filter
 * of that time
 * @param columnState The column state to change, starting with the defaults
 * @param record The stored record
 */
const applyFilterRecord = (
	columnState: IDataGridColumnsState,
	record: unknown,
) => {
	const filter = asRecord(record);
	for (const field in filter) {
		// see applyFilterList, a filter for a gone column would reach the backend
		if (!Object.prototype.hasOwnProperty.call(columnState, field)) continue;
		// null is a deliberately cleared default, anything unusable is skipped
		const value = filter[field];
		if (value !== null && !isPlainObject(value)) continue;
		columnState[field] = {
			...columnState[field],
			filter: value === null ? undefined : asFilterDef(value),
		};
	}
};

const decode = (
	persisted: DataGridPersistedData,
	columns: IDataGridColumnDef[],
	defaultColumnState: IDataGridColumnsState,
	config: DataGridProps["persist"],
): DataGridDecodedState => {
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
			for (const field of shown) columnHidden[field] = false;
			for (const field of hidden) columnHidden[field] = true;
			for (const field of [...shown, ...hidden]) {
				columnPinned[field] = pinned.includes(field);
			}
			for (const column of columns) {
				if (column.forcePin) columnPinned[column.field] = true;
			}
		}
		result.columnWidth = asWidths(data.width);
		if (typeof data.initialResize === "boolean")
			result.state.initialResize = data.initialResize;
	}

	if (cfg.includes("sort")) {
		if (Array.isArray(data.sort)) applySortList(result.columnState, data.sort);
		else applySortRecord(result.columnState, data.sort);
	}

	if (cfg.includes("filters")) {
		if (Array.isArray(data.filter))
			applyFilterList(result.columnState, data.filter);
		else applyFilterRecord(result.columnState, data.filter);
		if (typeof data.search === "string") result.state.search = data.search;
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
 * Data of a newer format (see isNewerPersistedState) is read with the rules of
 * this version: what is stored where this version looks.
 * @param persisted The persisted data, in any format we ever wrote
 * @param columns The column definitions
 * @param defaultColumnState The column state the grid would start out with
 * @param config What to persist (DataGridProps.persist)
 */
export const decodePersistedState = (
	persisted: DataGridPersistedData | undefined,
	columns: IDataGridColumnDef[],
	defaultColumnState: IDataGridColumnsState,
	config: DataGridProps["persist"],
): DataGridDecodedState => {
	if (!persisted || typeof persisted !== "object")
		return getDecodedDefaults(columns, defaultColumnState);
	try {
		return decode(persisted, columns, defaultColumnState, config);
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(
			"[Components-Care] Failed decoding persisted DataGrid state, falling back to the defaults",
			persisted,
			e,
		);
		return getDecodedDefaults(columns, defaultColumnState);
	}
};

/**
 * Splits the persisted data into the sizing part (belongs into fast, local
 * storage) and everything else (belongs into shared, server side storage)
 * @param data The data to split
 */
export const splitPersistedState = (
	data: DataGridPersistentState,
): [sizing: DataGridPersistentState, rest: DataGridPersistentState] => {
	const { width, initialResize, ...rest } = data;
	return [{ v: data.v, width, initialResize }, rest];
};

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
export const mergePersistedState = (
	parts: (DataGridPersistedData | undefined)[],
): DataGridPersistedData | undefined => {
	const current = parts.filter(
		(part): part is DataGridPersistentState => !!part && !isLegacy(part),
	);
	if (current.length) {
		let merged: DataGridPersistentState | undefined;
		for (const part of parts) {
			if (!part) continue;
			merged = {
				...merged,
				...(isLegacy(part) ? migrateLegacyPersistedState(part) : part),
			};
		}
		// the version of the parts stored in the current format (or a newer
		// one), not the one the migration of a legacy part put in
		return { ...merged, v: Math.max(...current.map((part) => part.v)) };
	}

	// every part is legacy data, which nests half of the split under state, so
	// a plain merge would drop whatever the earlier part had in there
	let result: DataGridPersistentStateLegacy | undefined;
	for (const part of parts as (DataGridPersistentStateLegacy | undefined)[]) {
		if (!part) continue;
		if (!result) {
			result = { ...part };
			continue;
		}
		const state = { ...result.state, ...part.state };
		result = { ...result, ...part };
		if (Object.keys(state).length) result.state = state;
	}
	return result;
};
