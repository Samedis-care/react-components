import React from "react";
import { ModelRecord, ModelUnknown } from "../../backend-integration";
import { DataGridProps } from "../../standalone/DataGrid/DataGrid";
/** The slots of BackendDataGridMultiSelect, for the theme's styleOverrides */
export type BackendDataGridMultiSelectClassKey = "root" | "label" | "status" | "grid";
export interface BackendDataGridMultiSelectProps<M extends ModelUnknown> extends Omit<DataGridProps, "columns" | "loadData" | "disableSelection" | "prohibitMultiSelect" | "customSelectionControl" | "onSelectionChange" | "selection" | "getRowLabel"> {
    /**
     * The model to load data from. The grid's row counts follow its connector's
     * ResponseMeta: with `filteredRows`, `totalRows` is the whole collection and
     * `filteredRows` the records that match the search and filters; without it,
     * `totalRows` is the matching records.
     */
    model: M;
    /**
     * The text that identifies a row to assistive technology, e.g. a person's
     * name: the row's checkbox is named after it ("Select Carol Jones") and a
     * control edited in a cell is named after it and its field
     * ("Active, Carol Jones").
     * Defaults to DataGridProps.getRowLabel's default: the text the first
     * visible text column shows.
     * @param record The row's record, as the model's index returned it
     * @return The label; an empty string names the checkbox "Select row" and
     *         leaves a control edited in a cell named after its field alone
     */
    getRowLabel?: (record: ModelRecord<M>) => string;
    /**
     * The field's label, shown above the grid as the legend of the field's fieldset, so
     * it also names the field (a group) for assistive technology. Without it the field
     * has no name: label it some other way.
     */
    label?: React.ReactNode;
    /**
     * Is the selection read-only? Then the grid shows it, but no row can be ticked or
     * unticked: the row checkboxes are disabled, a click on a row ticks nothing (the
     * grid's canSelectRow is not used), there is no select all checkbox
     * (enableSelectAll) and onChange is never called. The search, the filters, the
     * sorting and the scrolling still work, to read the selection.
     * @default false
     */
    readOnly?: boolean;
    /**
     * The ids of the selected records. The grid lists the records selected when it loads
     * (when it mounts, and after a search, a filter, a sort or forceRefreshToken changed)
     * first, ticked, and the others after them. A tick or an untick does not move a row:
     * an unticked record stays at the top until the grid loads again.
     */
    selected: string[];
    /**
     * Called when the user ticks or unticks a row or the select all checkbox (ticked, once
     * the records it selects are loaded). Not called in read-only mode (readOnly).
     * @param selected The ids of the selected records
     */
    onChange: (selected: string[]) => void;
    /**
     * Show the select all checkbox, in the grid's footer and in the header of its
     * selection column. Ticked, it selects every record matching the search and the
     * filters by its id: the grid loads the pages it hasn't loaded yet, one after another,
     * and then calls onChange with the ids of all of them (limitSelectAll bounds this).
     * Selected records that don't match are unselected. Unticked, it clears the
     * selection. Not shown in read-only mode (readOnly).
     * @default false
     */
    enableSelectAll?: boolean;
    /**
     * Make the select all checkbox (enableSelectAll) select only this many records (a
     * positive integer): the first ones matching the search and the filters, in the
     * grid's order (the records selected when it loaded first). While more records match,
     * the checkbox is labelled "First" and the limit instead of "All".
     * @default undefined (select all selects every matching record)
     */
    limitSelectAll?: number;
}
/**
 * Multi selection as a DataGrid over a model, with a checkbox per row: a fieldset with the
 * label as its legend, the number of selected rows ("Selected: 2", a polite status that
 * also describes the field) and the grid, which fills the rest of the field's height. It
 * needs a parent with a height. Theme name for styleOverrides:
 * `CcBackendDataGridMultiSelect` (slots root, label, status, grid).
 */
declare const BackendDataGridMultiSelect: <M extends ModelUnknown>(props: BackendDataGridMultiSelectProps<M>) => React.JSX.Element;
declare const _default: typeof BackendDataGridMultiSelect;
export default _default;
