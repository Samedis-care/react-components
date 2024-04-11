import React, { useCallback, useState } from "react";
import {
	Checkbox,
	FormControlLabel,
	Grid,
	List,
	ListItemText,
	MenuItem,
	Select,
	TextField,
	Tooltip,
} from "@mui/material";
import { Delete as ClearIcon } from "@mui/icons-material";
import FilterCombinator from "./FilterCombinator";
import { ModelFilterType } from "../../../backend-integration/Model";
import {
	DataGridFilterClearButton,
	DataGridSetFilterContainer,
	DataGridSetFilterData,
	DataGridSetFilterListDivider,
	DataGridSetFilterListItem,
	DataGridSetFilterListItemDivider,
	IDataGridColumnDef,
	useDataGridProps,
} from "../DataGrid";
import {
	LocalizedDateTimePicker,
	LocalizedKeyboardDatePicker,
} from "../../LocalizedDateTimePickers";
import useCCTranslations from "../../../utils/useCCTranslations";
import { normalizeDate } from "../../../backend-integration/Model/Types/Utils/DateUtils";
import { SelectChangeEvent } from "@mui/material/Select/SelectInput";
import moment, { Moment } from "moment";

export type FilterType =
	| "contains"
	| "notContains"
	| "equals"
	| "notEqual"
	| "empty"
	| "notEmpty"
	| "startsWith"
	| "endsWith"
	| "lessThan"
	| "lessThanOrEqual"
	| "greaterThan"
	| "greaterThanOrEqual"
	| "inRange"
	| "inSet"
	| "notInSet";
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

const ENUM_FILTER_MAGIC_EMPTY = "__MAGIC_EMPTY__";
const TYPOGRAPHY_PROPS = { noWrap: true };

const FilterEntry = (props: DataGridContentFilterEntryProps) => {
	const { onChange, depth, close } = props;
	const isFirstFilter = depth === 1;
	const { t } = useCCTranslations();
	const { filterLimit, isFilterSupported, classes } = useDataGridProps();

	const [enumFilterSearch, setEnumFilterSearch] = useState("");

	const maxDepth = filterLimit;
	const defaultFilterType = [
		"string",
		"localized-string",
		"combined-string",
	].includes(props.valueType ?? "")
		? "contains"
		: props.valueType === "enum"
			? "inSet"
			: "equals";
	let filterType: FilterType = props.value?.type || defaultFilterType;
	let filterValue = props.value?.value1 || "";
	let filterValue2 = props.value?.value2 || "";
	let subFilterComboType: FilterComboType =
		props.value?.nextFilterType || "and";
	let subFilter = props.value?.nextFilter || undefined;

	const checkSupport = (
		dataType: ModelFilterType,
		filterType: FilterType,
	): boolean => {
		if (!isFilterSupported) return true;
		return isFilterSupported(dataType, filterType, props.field);
	};

	const resetFilter = useCallback(() => {
		onChange({ type: defaultFilterType, value1: "", value2: "" });
		close();
	}, [close, onChange, defaultFilterType]);

	const updateParent = () =>
		onChange({
			type: filterType,
			value1: filterValue,
			value2: filterValue2,
			nextFilterType: subFilterComboType,
			nextFilter: subFilter,
		});

	const onFilterTypeChange = (event: SelectChangeEvent<FilterType>) => {
		// clear magic value
		if (filterType === "empty" || filterType === "notEmpty") {
			filterValue = "";
		}
		filterType = event.target.value as FilterType;
		// set magic value to mark filter as active
		if (filterType === "empty" || filterType === "notEmpty") {
			filterValue = filterType;
		}
		filterValue2 = "";
		updateParent();
	};

	const enumFilterInverted = ["notEmpty", "notInSet"].includes(filterType);
	const onFilterTypeChangeEnum = (
		_: React.ChangeEvent<HTMLInputElement>,
		checked: boolean,
	) => {
		filterType = checked ? "notInSet" : "inSet";
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
	const onFilterValueChangeDate = (date: Moment | null) => {
		filterValue = "";
		if (!date) {
			subFilterComboType = "and";
			subFilter = undefined;
		} else if (date.isValid()) {
			filterValue = normalizeDate(date.toDate()).toISOString();
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

	const handleNullEnum = () => {
		// deal with empty/null enum values by using empty/notEmpty filter (possibly chained via OR or AND if inverted)
		const split = filterValue.split(",");
		const hasEmpty = split.includes(ENUM_FILTER_MAGIC_EMPTY);
		const isInverted = ["notEmpty", "notInSet"].includes(filterType);
		if (split.length === 1) {
			filterType = isInverted
				? hasEmpty
					? "notEmpty"
					: "notInSet"
				: hasEmpty
					? "empty"
					: "inSet";
			subFilter = undefined;
		} else if (hasEmpty) {
			filterType = isInverted ? "notInSet" : "inSet";
			subFilterComboType = isInverted ? "and" : "or";
			subFilter = {
				type: isInverted ? "notEmpty" : "empty",
				value1: isInverted ? "notEmpty" : "empty",
				value2: "",
				nextFilter: undefined,
				nextFilterType: undefined,
			};
		}
	};

	const onFilterValueChangeEnumAll = (
		_: React.ChangeEvent<HTMLInputElement>,
		checked: boolean,
	) => {
		if (checked) {
			filterValue = (props.valueData as DataGridSetFilterData)
				.filter((entry) => !entry.isDivider)
				.map((entry) => entry.value || ENUM_FILTER_MAGIC_EMPTY)
				.join(",");
		} else {
			filterValue = "";
		}
		handleNullEnum();
		updateParent();
	};
	const onFilterValueChangeEnum = (
		evt: React.ChangeEvent<HTMLInputElement>,
		checked: boolean,
	) => {
		let currentlyChecked =
			filterValue.length === 0 ? [] : filterValue.split(",");
		if (!checked) {
			currentlyChecked = currentlyChecked.filter(
				(val) => val !== evt.target.value,
			);
		} else {
			currentlyChecked.push(evt.target.value);
		}
		filterValue = currentlyChecked.join(",");
		handleNullEnum();
		updateParent();
	};
	const onFilterValue2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
		filterValue2 = event.target.value;
		updateParent();
	};
	const onFilterValue2ChangeDate = (date: Moment | null) => {
		filterValue2 = date ? normalizeDate(date.toDate()).toISOString() : "";
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

	let filterTypeMenuItems = [
		checkSupport(props.valueType, "equals") && (
			<MenuItem key={"equals"} value={"equals"}>
				{t("standalone.data-grid.content.filter-type.eq")}
			</MenuItem>
		),
		checkSupport(props.valueType, "notEqual") && (
			<MenuItem key={"notEqual"} value={"notEqual"}>
				{t("standalone.data-grid.content.filter-type.not-eq")}
			</MenuItem>
		),
		checkSupport(props.valueType, "empty") && (
			<MenuItem key={"empty"} value={"empty"}>
				{t("standalone.data-grid.content.filter-type.empty")}
			</MenuItem>
		),
		checkSupport(props.valueType, "notEmpty") && (
			<MenuItem key={"notEmpty"} value={"notEmpty"}>
				{t("standalone.data-grid.content.filter-type.not-empty")}
			</MenuItem>
		),
	];
	if (
		["string", "localized-string", "combined-string"].includes(
			props.valueType ?? "",
		)
	) {
		filterTypeMenuItems.push(
			checkSupport(props.valueType, "contains") && (
				<MenuItem key={"contains"} value={"contains"}>
					{t("standalone.data-grid.content.filter-type.contains")}
				</MenuItem>
			),
			checkSupport(props.valueType, "notContains") && (
				<MenuItem key={"notContains"} value={"notContains"}>
					{t("standalone.data-grid.content.filter-type.not-contains")}
				</MenuItem>
			),
			checkSupport(props.valueType, "startsWith") && (
				<MenuItem key={"startsWith"} value={"startsWith"}>
					{t("standalone.data-grid.content.filter-type.starts-with")}
				</MenuItem>
			),
			checkSupport(props.valueType, "endsWith") && (
				<MenuItem key={"endsWith"} value={"endsWith"}>
					{t("standalone.data-grid.content.filter-type.ends-with")}
				</MenuItem>
			),
		);
	} else if (props.valueType === "number") {
		filterTypeMenuItems.push(
			checkSupport(props.valueType, "lessThan") && (
				<MenuItem key={"lessThan"} value={"lessThan"}>
					{t("standalone.data-grid.content.filter-type.lt")}
				</MenuItem>
			),
			checkSupport(props.valueType, "lessThanOrEqual") && (
				<MenuItem key={"lessThanOrEqual"} value={"lessThanOrEqual"}>
					{t("standalone.data-grid.content.filter-type.lte")}
				</MenuItem>
			),
			checkSupport(props.valueType, "greaterThan") && (
				<MenuItem key={"greaterThan"} value={"greaterThan"}>
					{t("standalone.data-grid.content.filter-type.gt")}
				</MenuItem>
			),
			checkSupport(props.valueType, "greaterThanOrEqual") && (
				<MenuItem key={"greaterThanOrEqual"} value={"greaterThanOrEqual"}>
					{t("standalone.data-grid.content.filter-type.gte")}
				</MenuItem>
			),
			checkSupport(props.valueType, "inRange") && (
				<MenuItem key={"inRange"} value={"inRange"}>
					{t("standalone.data-grid.content.filter-type.in-range")}
				</MenuItem>
			),
		);
	} else if (props.valueType === "date" || props.valueType === "datetime") {
		filterTypeMenuItems.push(
			checkSupport(props.valueType, "lessThan") && (
				<MenuItem key={"lessThan"} value={"lessThan"}>
					{t("standalone.data-grid.content.filter-type.lt-date")}
				</MenuItem>
			),
			checkSupport(props.valueType, "lessThanOrEqual") && (
				<MenuItem key={"lessThanOrEqual"} value={"lessThanOrEqual"}>
					{t("standalone.data-grid.content.filter-type.lte-date")}
				</MenuItem>
			),
			checkSupport(props.valueType, "greaterThan") && (
				<MenuItem key={"greaterThan"} value={"greaterThan"}>
					{t("standalone.data-grid.content.filter-type.gt-date")}
				</MenuItem>
			),
			checkSupport(props.valueType, "greaterThanOrEqual") && (
				<MenuItem key={"greaterThanOrEqual"} value={"greaterThanOrEqual"}>
					{t("standalone.data-grid.content.filter-type.gte-date")}
				</MenuItem>
			),
			checkSupport(props.valueType, "inRange") && (
				<MenuItem key={"inRange"} value={"inRange"}>
					{t("standalone.data-grid.content.filter-type.in-range-date")}
				</MenuItem>
			),
		);
	}

	filterTypeMenuItems = filterTypeMenuItems.filter((e) => e);

	return (
		<>
			{isFirstFilter && props.value?.value1 && (
				<Grid item xs={12}>
					<Grid container justifyContent={"flex-end"} alignItems={"center"}>
						<Grid item>
							<Tooltip
								title={
									t("standalone.data-grid.content.reset-column-filter") ?? ""
								}
							>
								<span>
									<DataGridFilterClearButton
										className={classes?.filterClearBtn}
										onClick={resetFilter}
										size="large"
									>
										<ClearIcon />
									</DataGridFilterClearButton>
								</span>
							</Tooltip>
						</Grid>
					</Grid>
				</Grid>
			)}
			{(props.valueType === "string" ||
				props.valueType === "localized-string" ||
				props.valueType === "combined-string" ||
				props.valueType === "number" ||
				props.valueType === "date" ||
				props.valueType === "datetime") && (
				<>
					<Grid item xs={12}>
						<Select onChange={onFilterTypeChange} value={filterType} fullWidth>
							{filterTypeMenuItems}
						</Select>
					</Grid>
					{filterType !== "empty" && filterType !== "notEmpty" && (
						<Grid item xs={12}>
							{props.valueType === "date" ? (
								<LocalizedKeyboardDatePicker
									value={filterValue === "" ? null : moment(filterValue)}
									onChange={onFilterValueChangeDate}
									fullWidth
									autoFocus={depth === 1}
								/>
							) : props.valueType === "datetime" ? (
								<LocalizedDateTimePicker
									value={filterValue === "" ? null : moment(filterValue)}
									onChange={onFilterValueChangeDate}
									fullWidth
									autoFocus={depth === 1}
								/>
							) : (
								<TextField
									value={filterValue}
									onChange={onFilterValueChange}
									fullWidth
									autoFocus={depth === 1}
								/>
							)}
						</Grid>
					)}
					{filterType === "inRange" && (
						<Grid item xs={12}>
							{props.valueType === "date" ? (
								<LocalizedKeyboardDatePicker
									value={filterValue2 === "" ? null : moment(filterValue2)}
									onChange={onFilterValue2ChangeDate}
								/>
							) : props.valueType === "datetime" ? (
								<LocalizedDateTimePicker
									value={filterValue2 === "" ? null : moment(filterValue2)}
									onChange={onFilterValueChangeDate}
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
								autoFocus={depth === 1}
							/>
						}
						label={(() => {
							if (!filterValue)
								return t("standalone.data-grid.content.bool-filter.any");
							const entry = props.valueData?.find(
								(entry) => entry.value === filterValue,
							);
							if (!entry)
								return t(
									"standalone.data-grid.content.bool-filter." + filterValue,
								);
							return (entry.getLabel ?? entry.getLabelText)();
						})()}
					/>
				</Grid>
			)}
			{props.valueType === "enum" && (
				<>
					{(props.valueData as DataGridSetFilterData).length > 10 && (
						<Grid item xs={12}>
							<TextField
								value={enumFilterSearch}
								onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
									setEnumFilterSearch(evt.target.value)
								}
								placeholder={t(
									"standalone.data-grid.content.set-filter.search",
								)}
								fullWidth
								autoFocus={depth === 1}
							/>
						</Grid>
					)}
					<DataGridSetFilterContainer
						item
						xs={12}
						className={classes?.setFilterContainer}
					>
						<List>
							{(props.valueData as DataGridSetFilterData).length > 5 && (
								<DataGridSetFilterListItem
									className={classes?.setFilterListItem}
								>
									<Checkbox
										checked={
											filterValue.split(",").sort().join(",") ===
											(props.valueData as DataGridSetFilterData)
												.filter((entry) => !entry.isDivider)
												.map((entry) => entry.value || ENUM_FILTER_MAGIC_EMPTY)
												.sort()
												.join(",")
										}
										onChange={onFilterValueChangeEnumAll}
									/>
									<ListItemText primaryTypographyProps={TYPOGRAPHY_PROPS}>
										{t("standalone.data-grid.content.set-filter.select-all")}
									</ListItemText>
								</DataGridSetFilterListItem>
							)}
							{checkSupport(props.valueType, "notInSet") && (
								<>
									<DataGridSetFilterListItem
										className={classes?.setFilterListItem}
									>
										<Checkbox
											checked={enumFilterInverted}
											onChange={onFilterTypeChangeEnum}
										/>
										<ListItemText primaryTypographyProps={TYPOGRAPHY_PROPS}>
											{t("standalone.data-grid.content.set-filter.invert")}
										</ListItemText>
									</DataGridSetFilterListItem>
									<DataGridSetFilterListItemDivider
										className={classes?.setFilterListItemDivider}
									>
										<DataGridSetFilterListDivider
											className={classes?.setFilterListDivider}
										/>
									</DataGridSetFilterListItemDivider>
								</>
							)}
							{(props.valueData as DataGridSetFilterData)
								.filter((entry) =>
									entry
										.getLabelText()
										.toLowerCase()
										.includes(enumFilterSearch.toLocaleLowerCase()),
								)
								.map((entry) => {
									const ListItemComp = entry.isDivider
										? DataGridSetFilterListItemDivider
										: DataGridSetFilterListItem;
									return (
										<ListItemComp
											key={entry.value}
											className={
												entry.isDivider
													? classes?.setFilterListItemDivider
													: classes?.setFilterListItem
											}
										>
											{entry.isDivider ? (
												<DataGridSetFilterListDivider
													className={classes?.setFilterListDivider}
												/>
											) : (
												<>
													<Checkbox
														value={entry.value || ENUM_FILTER_MAGIC_EMPTY}
														checked={filterValue
															.split(",")
															.includes(entry.value || ENUM_FILTER_MAGIC_EMPTY)}
														onChange={onFilterValueChangeEnum}
														disabled={entry.disabled}
													/>
													<ListItemText
														primaryTypographyProps={TYPOGRAPHY_PROPS}
													>
														{(entry.getLabel || entry.getLabelText)()}
													</ListItemText>
												</>
											)}
										</ListItemComp>
									);
								})}
						</List>
					</DataGridSetFilterContainer>
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
							field={props.field}
							onChange={onSubFilterChange}
							valueType={props.valueType}
							valueData={props.valueData}
							value={subFilter}
							close={close}
							depth={depth + 1}
						/>
					</>
				)}
		</>
	);
};

export default React.memo(FilterEntry);
