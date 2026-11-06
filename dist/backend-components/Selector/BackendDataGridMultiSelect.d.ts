import React from "react";
import { ModelRecord, ModelUnknown } from "../../backend-integration";
import { DataGridProps } from "../../standalone/DataGrid/DataGrid";
/** The slots of BackendDataGridMultiSelect, for the theme's styleOverrides */
export type BackendDataGridMultiSelectClassKey = "root" | "label" | "status" | "grid";
export interface BackendDataGridMultiSelectProps<M extends ModelUnknown> extends Omit<DataGridProps, "columns" | "loadData" | "disableSelection" | "prohibitMultiSelect" | "customSelectionControl" | "onSelectionChange" | "selection" | "getRowLabel"> {
    /**
     * The model to load data from
     */
    model: M;
    /**
     * The text that identifies a row to assistive technology, e.g. a person's
     * name: the row's checkbox is named after it ("Select Carol Jones").
     * Defaults to DataGridProps.getRowLabel's default: the text the first
     * visible text column shows.
     * @param record The row's record, as the model's index returned it
     * @return The label; an empty string names the checkbox "Select row"
     */
    getRowLabel?: (record: ModelRecord<M>) => string;
    /**
     * The field's label, shown above the grid as the legend of the field's fieldset, so
     * it also names the field (a group) for assistive technology. Without it the field
     * has no name: label it some other way.
     */
    label?: React.ReactNode;
    /**
     * Selection read only?
     */
    readOnly?: boolean;
    /**
     * The current selection
     */
    selected: string[];
    /**
     * Selection change handler
     * @param selected The new selected IDS
     * @remarks May return the same ID array in a different array instance to force re-rendering (only read-only mode)
     */
    onChange: (selected: string[]) => void;
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
