import React, { useContext } from "react";
import { Grid, MenuItem, Select, TextField } from "@material-ui/core";
import FilterCombinator from "./FilterCombinator";
import { ModelFilterType } from "../../../backend-integration/Model";
import { DataGridPropsContext } from "../index";
import { LocalizedKeyboardDatePicker } from "../../LocalizedDateTimePickers";
import { DateType } from "@date-io/type";

export type FilterType =
	| "contains"
	| "notContains"
	| "equals"
	| "notEqual"
	| "startsWith"
	| "endsWith"
	| "lessThan"
	| "lessThanOrEqual"
	| "greaterThan"
	| "greaterThanOrEqual"
	| "inRange";
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

interface IProps {
	/**
	 * The type of the column value (string, number, etc). See ValueType
	 */
	valueType: ModelFilterType;
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
	 * The depth of the filter in the given filter chain
	 */
	depth: number;
}

const FilterEntry = (props: IProps) => {
	const { onChange, depth } = props;
	const gridProps = useContext(DataGridPropsContext);
	if (!gridProps) throw new Error("DataGrid Props Context not set");
	const maxDepth = gridProps.filterLimit;
	let filterType: FilterType =
		props.value?.type || (props.valueType === "string" ? "contains" : "equals");
	let filterValue = props.value?.value1 || "";
	let filterValue2 = props.value?.value2 || "";
	let subFilterComboType: FilterComboType =
		props.value?.nextFilterType || "and";
	let subFilter = props.value?.nextFilter || undefined;

	const updateParent = () =>
		onChange({
			type: filterType,
			value1: filterValue,
			value2: filterValue2,
			nextFilterType: subFilterComboType,
			nextFilter: subFilter,
		});

	const onFilterTypeChange = (
		event: React.ChangeEvent<{ name?: string; value: unknown }>
	) => {
		filterType = event.target.value as FilterType;
		filterValue2 = "";
		updateParent();
	};
	const onFilterValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		filterValue = event.target.value;
		if (!filterValue) {
			subFilterComboType = "and";
			subFilter = undefined;
		}
		updateParent();
	};
	const onFilterValueChangeDate = (date: DateType | null) => {
		if (!date) {
			filterValue = "";
			subFilterComboType = "and";
			subFilter = undefined;
		} else {
			filterValue = date.toISOString();
		}
		updateParent();
	};
	const onFilterValue2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
		filterValue2 = event.target.value;
		updateParent();
	};
	const onFilterValue2ChangeDate = (date: DateType | null) => {
		filterValue = date ? date.toISOString() : "";
		updateParent();
	};
	const onSubFilterTypeChange = (value: FilterComboType) => {
		subFilterComboType = value;
		updateParent();
	};
	const onSubFilterChange = (value: IFilterDef) => {
		subFilter = value;
		updateParent();
	};

	const filterTypeMenuItems = [
		<MenuItem key={"equals"} value={"equals"}>
			Equals
		</MenuItem>,
		<MenuItem key={"notEqual"} value={"notEqual"}>
			Not equal
		</MenuItem>,
	];
	if (props.valueType === "string") {
		filterTypeMenuItems.push(
			<MenuItem key={"contains"} value={"contains"}>
				Contains
			</MenuItem>,
			<MenuItem key={"notContains"} value={"notContains"}>
				Not contains
			</MenuItem>,
			<MenuItem key={"startsWith"} value={"startsWith"}>
				Starts with
			</MenuItem>,
			<MenuItem key={"endsWith"} value={"endsWith"}>
				Ends with
			</MenuItem>
		);
	} else if (props.valueType === "number" || props.valueType === "date") {
		filterTypeMenuItems.push(
			<MenuItem key={"lessThan"} value={"lessThan"}>
				Less than
			</MenuItem>,
			<MenuItem key={"lessThanOrEqual"} value={"lessThanOrEqual"}>
				Less than or equals
			</MenuItem>,
			<MenuItem key={"greaterThan"} value={"greaterThan"}>
				Greater than
			</MenuItem>,
			<MenuItem key={"greaterThanOrEqual"} value={"greaterThanOrEqual"}>
				Greater than or equals
			</MenuItem>,
			<MenuItem key={"inRange"} value={"inRange"}>
				In range
			</MenuItem>
		);
	}

	return (
		<>
			{(props.valueType === "string" ||
				props.valueType === "number" ||
				props.valueType === "date") && (
				<>
					<Grid item xs={12}>
						<Select onChange={onFilterTypeChange} value={filterType} fullWidth>
							{filterTypeMenuItems}
						</Select>
					</Grid>
					<Grid item xs={12}>
						{props.valueType === "date" ? (
							<LocalizedKeyboardDatePicker
								value={filterValue}
								onChange={onFilterValueChangeDate}
								fullWidth
							/>
						) : (
							<TextField
								value={filterValue}
								onChange={onFilterValueChange}
								fullWidth
							/>
						)}
					</Grid>
					{filterType === "inRange" && (
						<Grid item xs={12}>
							{props.valueType === "date" ? (
								<LocalizedKeyboardDatePicker
									value={filterValue2}
									onChange={onFilterValue2ChangeDate}
									fullWidth
								/>
							) : (
								<TextField
									value={filterValue2}
									onChange={onFilterValue2Change}
									fullWidth
								/>
							)}
						</Grid>
					)}
				</>
			)}
			{
				props.valueType === "boolean" && <></> // TODO
			}
			{filterValue &&
				props.valueType !== "enum" &&
				(!maxDepth || depth <= maxDepth) && (
					<>
						<FilterCombinator
							value={subFilterComboType}
							onChange={onSubFilterTypeChange}
						/>
						<FilterEntry
							onChange={onSubFilterChange}
							valueType={props.valueType}
							value={subFilter}
							depth={depth + 1}
						/>
					</>
				)}
		</>
	);
};

export default React.memo(FilterEntry);
