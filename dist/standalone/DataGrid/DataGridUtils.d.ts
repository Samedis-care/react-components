import { DataGridCustomDataType } from "./DataGrid";
export declare const useDataGridFiltersActive: () => boolean;
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
export declare const isDataGridCustomFilterActive: (value: unknown, defaultValue: unknown) => boolean;
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
export declare const areDataGridCustomFiltersActive: (customData: DataGridCustomDataType, defaultCustomData: DataGridCustomDataType | undefined) => boolean;
/**
 * Whether the grid's custom data holds an active filter
 * (areDataGridCustomFiltersActive against defaultCustomData). It follows the
 * grid state, so it does not depend on which filter controls are mounted, and
 * an app's own controls count like the Grid*Filter helpers.
 * @returns true while a custom filter is active
 */
export declare const useDataGridCustomFiltersActive: () => boolean;
export declare const useDataGridResetFilters: () => () => void;
