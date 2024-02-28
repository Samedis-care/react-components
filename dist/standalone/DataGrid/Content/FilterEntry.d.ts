import React from "react";
import { ModelFilterType } from "../../../backend-integration/Model";
import { IDataGridColumnDef } from "../DataGrid";
export type FilterType = "contains" | "notContains" | "equals" | "notEqual" | "empty" | "notEmpty" | "startsWith" | "endsWith" | "lessThan" | "lessThanOrEqual" | "greaterThan" | "greaterThanOrEqual" | "inRange" | "inSet" | "notInSet";
export type FilterComboType = "or" | "and";
export interface IFilterDef {
    /**
     * Type of comparison
     */
    type: FilterType;
    /**
     * Value for comparison, always present
     */
    value1: string;
    /**
     * Second value for comparison, only present in select cases:
     * - type == "inRange"
     */
    value2: string;
    /**
     * How to threat next filter entry (and or or)
     */
    nextFilterType?: FilterComboType;
    /**
     * The next filter to apply to the column
     */
    nextFilter?: IFilterDef;
}
export interface DataGridContentFilterEntryProps {
    /**
     * The column field name
     */
    field: string;
    /**
     * The type of the column value (string, number, etc). See ValueType
     */
    valueType: ModelFilterType;
    /**
     * Metadata for the filter
     */
    valueData: IDataGridColumnDef["filterData"];
    /**
     * The currently active filter
     */
    value?: IFilterDef;
    /**
     * Update filter
     * @param def The new filter
     */
    onChange: (def: IFilterDef) => void;
    /**
     * Callback to close filter
     */
    close: () => void;
    /**
     * The depth of the filter in the given filter chain
     */
    depth: number;
}
declare const _default: React.MemoExoticComponent<(props: DataGridContentFilterEntryProps) => React.JSX.Element>;
export default _default;
