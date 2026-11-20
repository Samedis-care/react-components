import { useCallback, useMemo } from "react";
import type { IFilterDef } from "./Content/FilterEntry";
import { normalizeFilterDef } from "./PersistFormat";
import {
	DataGridCustomDataType,
	getDataGridDefaultColumnsState,
	getDataGridDefaultState,
	useDataGridColumnState,
	useDataGridProps,
	useDataGridState,
} from "./DataGrid";
import { deepEqual } from "../../utils";

export const useDataGridFiltersActive = () => {
	const [state] = useDataGridState();
	const [columnState] = useDataGridColumnState();
	const { columns, defaultSort, defaultFilter, defaultCustomData } =
		useDataGridProps();

	return useMemo(() => {
		const defaultState = getDataGridDefaultState(columns, defaultCustomData);
		const defaultColumnState = getDataGridDefaultColumnsState(
			columns,
			defaultSort,
			defaultFilter,
		);
		return (
			state.search !== defaultState.search ||
			// a value deepEqual can't look into (a class instance, Map,
			// function) is compared by identity
			!deepEqual(
				withoutUndefinedKeys(state.customData),
				withoutUndefinedKeys(defaultState.customData),
				"equals",
			) ||
			// a filter counts by the conditions that filter, not by how the
			// filter popup spelled them
			Object.entries(columnState).some(
				([key, value]) =>
					!isSameFilterDef(value.filter, defaultColumnState[key]?.filter),
			)
		);
	}, [
		columnState,
		columns,
		defaultCustomData,
		defaultFilter,
		defaultSort,
		state.customData,
		state.search,
	]);
};

/**
 * Whether two filters are the same condition. Only the conditions carrying a
 * value count (see normalizeFilterDef), and the spellings of one condition are
 * equal: a key set to undefined and a missing one, a missing value2 and "", a
 * missing nextFilterType and "and" (as the filter popup reads it), and any
 * nextFilterType of a condition without a nextFilter, which combines nothing.
 * Keys IFilterDef does not define are not compared. The filter popup emits a
 * filter in its own spelling, also when the user empties it or ends on the
 * condition they started with, e.g. a default filter.
 * @param a The one filter
 * @param b The other filter
 * @returns true if both are the same condition, or both are no filter
 */
const isSameFilterDef = (
	a: IFilterDef | null | undefined,
	b: IFilterDef | null | undefined,
): boolean => {
	let left = normalizeFilterDef(a);
	let right = normalizeFilterDef(b);
	// normalizeFilterDef ends both chains within a bounded number of conditions
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
 * The custom data without its keys set to undefined: such a key filters
 * nothing, as the query leaves it out
 * @param customData The custom data
 * @returns The keys of customData that hold a value (null counts as one)
 */
const withoutUndefinedKeys = (
	customData: DataGridCustomDataType,
): DataGridCustomDataType =>
	Object.fromEntries(
		Object.entries(customData).filter(([, value]) => value !== undefined),
	);

/**
 * Whether a custom data value counts as unset: undefined, null, "" and []
 * @param value The value of one custom data key
 * @returns true for an empty value
 */
const isEmptyCustomDataValue = (value: unknown): boolean =>
	value == null || value === "" || (Array.isArray(value) && value.length === 0);

/**
 * Whether two lists hold the same entries in any order (deepEqual per entry,
 * every duplicate counted)
 * @param a The first list
 * @param b The second list
 * @returns true if b is a reordering of a
 */
const sameEntries = (a: unknown[], b: unknown[]): boolean => {
	if (a.length !== b.length) return false;
	const rest = [...b];
	return a.every((entry) => {
		const idx = rest.findIndex((other) => deepEqual(entry, other));
		if (idx === -1) return false;
		rest.splice(idx, 1);
		return true;
	});
};

/**
 * Whether one custom data value is an active filter: it differs from its
 * default (the key's value in DataGridProps.defaultCustomData). Empty values
 * (undefined, null, "" and []) count as unset, so they equal each other, and
 * lists compare in any order. The Grid*Filter helpers highlight themselves by
 * this rule; an app's own filter bar control can use it the same way.
 * @param value The key's value in the custom data
 * @param defaultValue The key's value in DataGridProps.defaultCustomData
 * @returns true while the value is an active filter
 */
export const isDataGridCustomFilterActive = (
	value: unknown,
	defaultValue: unknown,
): boolean => {
	const empty = isEmptyCustomDataValue(value);
	const defaultEmpty = isEmptyCustomDataValue(defaultValue);
	if (empty || defaultEmpty) return empty !== defaultEmpty;
	if (Array.isArray(value) && Array.isArray(defaultValue))
		return !sameEntries(value, defaultValue);
	return !deepEqual(value, defaultValue);
};

/**
 * Whether custom data holds an active filter: one of its keys, or one of the
 * default's keys, is active by the rule of isDataGridCustomFilterActive. The
 * DataGrid marks its filter panel's "Filter" button by this rule; an app that
 * shows the filter bar in a dialog of its own can mark its button the same way.
 * @param customData The custom data (what the filter bar's controls set)
 * @param defaultCustomData DataGridProps.defaultCustomData, which "Reset
 *                          filter" restores
 * @returns true while a custom filter is active
 */
export const areDataGridCustomFiltersActive = (
	customData: DataGridCustomDataType,
	defaultCustomData: DataGridCustomDataType | undefined,
): boolean => {
	const defaults = defaultCustomData ?? {};
	return Array.from(
		new Set([...Object.keys(customData), ...Object.keys(defaults)]),
	).some((key) => isDataGridCustomFilterActive(customData[key], defaults[key]));
};

/**
 * Whether the grid's custom data holds an active filter
 * (areDataGridCustomFiltersActive against defaultCustomData). It follows the
 * grid state, so it does not depend on which filter controls are mounted, and
 * an app's own controls count like the Grid*Filter helpers.
 * @returns true while a custom filter is active
 */
export const useDataGridCustomFiltersActive = (): boolean => {
	const [state] = useDataGridState();
	const { defaultCustomData } = useDataGridProps();

	return useMemo(
		() => areDataGridCustomFiltersActive(state.customData, defaultCustomData),
		[defaultCustomData, state.customData],
	);
};

export const useDataGridResetFilters = () => {
	const [, setState] = useDataGridState();
	const [, setColumnState] = useDataGridColumnState();
	const { columns, defaultSort, defaultFilter, defaultCustomData } =
		useDataGridProps();

	return useCallback(() => {
		const defaultState = getDataGridDefaultState(columns, defaultCustomData);
		const defaultColumnState = getDataGridDefaultColumnsState(
			columns,
			defaultSort,
			defaultFilter,
		);
		setState((state) => ({
			...state,
			search: defaultState.search,
			customData: defaultState.customData,
			// the filters are the user's own again, see filtersOverridden
			filtersOverridden: defaultState.filtersOverridden,
		}));
		setColumnState((colState) =>
			Object.fromEntries(
				Object.entries(colState).map(([field, def]) => [
					field,
					{ ...def, filter: defaultColumnState[field]?.filter },
				]),
			),
		);
	}, [
		columns,
		defaultCustomData,
		defaultFilter,
		defaultSort,
		setColumnState,
		setState,
	]);
};
