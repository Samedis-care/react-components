import React, { useContext, useState } from "react";
import {
	Checkbox,
	FormControlLabel,
	Grid,
	List,
	ListItem,
	ListItemText,
	MenuItem,
	Select,
	TextField,
} from "@material-ui/core";
import FilterCombinator from "./FilterCombinator";
import { ModelFilterType } from "../../../backend-integration/Model";
import {
	DataGridPropsContext,
	DataGridSetFilterData,
	IDataGridColumnDef,
} from "../index";
import { LocalizedKeyboardDatePicker } from "../../LocalizedDateTimePickers";
import { DateType } from "@date-io/type";
import ccI18n from "../../../i18n";
import { makeStyles } from "@material-ui/core/styles";

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
	| "inRange"
	| "inSet";
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
	 * The depth of the filter in the given filter chain
	 */
	depth: number;
}

const useStyles = makeStyles({
	setFilterContainer: {
		maxHeight: "40vh",
		overflow: "auto",
	},
});

const FilterEntry = (props: IProps) => {
	const { onChange, depth } = props;
	const gridProps = useContext(DataGridPropsContext);
	if (!gridProps) throw new Error("DataGrid Props Context not set");

	const [enumFilterSearch, setEnumFilterSearch] = useState("");

	const classes = useStyles();

	const maxDepth = gridProps.filterLimit;
	let filterType: FilterType =
		props.value?.type ||
		(props.valueType === "string"
			? "contains"
			: props.valueType === "enum"
			? "inSet"
			: "equals");
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
	const onFilterValueChangeBool = () => {
		filterType = "equals";
		if (!filterValue) {
			filterValue = "true";
		} else if (filterValue === "true") {
			filterValue = "false";
		} else {
			filterValue = "";
		}
		updateParent();
	};
	const onFilterValueChangeEnumAll = (
		_: React.ChangeEvent<HTMLInputElement>,
		checked: boolean
	) => {
		if (checked) {
			filterValue = (props.valueData as DataGridSetFilterData)
				.map((entry) => entry.value)
				.join(",");
		} else {
			filterValue = "";
		}
		updateParent();
	};
	const onFilterValueChangeEnum = (
		evt: React.ChangeEvent<HTMLInputElement>,
		checked: boolean
	) => {
		let currentlyChecked = filterValue.split(",");
		if (!checked) {
			currentlyChecked = currentlyChecked.filter(
				(val) => val !== evt.target.value
			);
		} else {
			currentlyChecked.push(evt.target.value);
		}
		filterValue = currentlyChecked.join(",");
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
			{props.valueType === "boolean" && (
				<Grid item xs={12}>
					<FormControlLabel
						control={
							<Checkbox
								checked={filterValue === "true"}
								onClick={onFilterValueChangeBool}
								indeterminate={!filterValue}
							/>
						}
						label={ccI18n.t(
							"standalone.data-grid.content.bool-filter." +
								(filterValue || "any")
						)}
					/>
				</Grid>
			)}
			{props.valueType === "enum" && (
				<>
					<Grid item xs={12}>
						<TextField
							value={enumFilterSearch}
							onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
								setEnumFilterSearch(evt.target.value)
							}
							placeholder={ccI18n.t(
								"standalone.data-grid.content.set-filter.search"
							)}
							fullWidth
						/>
					</Grid>
					<Grid item xs={12} className={classes.setFilterContainer}>
						<List>
							<ListItem>
								<Checkbox
									checked={
										filterValue ===
										(props.valueData as DataGridSetFilterData)
											.map((entry) => entry.value)
											.join(",")
									}
									onChange={onFilterValueChangeEnumAll}
								/>
								<ListItemText>
									{ccI18n.t(
										"standalone.data-grid.content.set-filter.select-all"
									)}
								</ListItemText>
							</ListItem>
							{(props.valueData as DataGridSetFilterData)
								.filter((entry) =>
									entry.getLabelText().toLowerCase().includes(enumFilterSearch)
								)
								.map((entry) => (
									<ListItem key={entry.value}>
										<Checkbox
											value={entry.value}
											checked={filterValue.split(",").includes(entry.value)}
											onChange={onFilterValueChangeEnum}
										/>
										<ListItemText>
											{(entry.getLabel || entry.getLabelText)()}
										</ListItemText>
									</ListItem>
								))}
						</List>
					</Grid>
				</>
			)}
			{filterValue &&
				props.valueType !== "enum" &&
				props.valueType !== "boolean" &&
				(!maxDepth || depth <= maxDepth) && (
					<>
						<FilterCombinator
							value={subFilterComboType}
							onChange={onSubFilterTypeChange}
						/>
						<FilterEntry
							onChange={onSubFilterChange}
							valueType={props.valueType}
							valueData={props.valueData}
							value={subFilter}
							depth={depth + 1}
						/>
					</>
				)}
		</>
	);
};

export default React.memo(FilterEntry);
