import React from "react";
import { Grid, MenuItem, Select, TextField } from "@material-ui/core";
import FilterCombinator from "./FilterCombinator";

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

export type ValueType = "string" | "number";

export interface IFilterDef {
	type: FilterType;
	value1: string;
	value2: string;
	nextFilterType?: FilterComboType;
	nextFilter?: IFilterDef;
}

interface IProps {
	valueType: ValueType;
	value?: IFilterDef;
	onChange: (def: IFilterDef) => void;
}

const FilterEntry = React.memo((props: IProps) => {
	const { onChange } = props;
	let filterType: FilterType =
		props.value?.type || props.valueType === "string" ? "contains" : "equals";
	let filterValue = props.value?.value1 || "";
	let filterValue2 = props.value?.value2 || "";
	let subFilterComboType: FilterComboType = props.value?.nextFilterType || "or";
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
	const onFilterValue2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
		filterValue2 = event.target.value;
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
	} else if (props.valueType === "number") {
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
			<Grid item xs={12}>
				<Select onChange={onFilterTypeChange} value={filterType} fullWidth>
					{filterTypeMenuItems}
				</Select>
			</Grid>
			<Grid item xs={12}>
				<TextField
					value={filterValue}
					onChange={onFilterValueChange}
					fullWidth
				/>
			</Grid>
			{/* @ts-ignore */}
			{filterType === "inRange" && (
				<Grid item xs={12}>
					<TextField
						value={filterValue2}
						onChange={onFilterValue2Change}
						fullWidth
					/>
				</Grid>
			)}
			{filterValue && (
				<>
					<FilterCombinator
						value={subFilterComboType}
						onChange={onSubFilterTypeChange}
					/>
					<FilterEntry
						onChange={onSubFilterChange}
						valueType={props.valueType}
					/>
				</>
			)}
		</>
	);
});

export default FilterEntry;
