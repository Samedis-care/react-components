import React from "react";
import "../../../i18n";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import { DataGrid } from "../../../standalone";
import { makeStyles } from "@material-ui/core/styles";
import {
	DataGridAdditionalFilters,
	DataGridData,
	DataGridRowData,
	DataGridSortSetting,
	IDataGridColumnDef,
	IDataGridFieldFilter,
} from "../../../standalone/DataGrid";
import { action, withActions } from "@storybook/addon-actions";
import { IDataGridExporter } from "../../../standalone/DataGrid/Header";
import { IFilterDef } from "../../../standalone/DataGrid/Content/FilterEntry";
import data from "./covid-daily.json";
import GridCustomFilters from "./GridCustomFilters";

const useStyles = makeStyles({
	wrapper: {
		width: "90vw",
		height: "90vh",
	},
});

const columnDef: IDataGridColumnDef[] = [
	{ type: "number", field: "date", headerName: "Date" },
	{ type: "number", field: "states", headerName: "States" },
	{ type: "number", field: "positive", headerName: "Positive" },
	{ type: "number", field: "negative", headerName: "Negative" },
	{ type: "number", field: "pending", headerName: "Pending" },
	{
		type: "number",
		field: "hospitalizedCurrently",
		headerName: "HospitalizedCurrently",
	},
	{
		type: "number",
		field: "hospitalizedCumulative",
		headerName: "HospitalizedCumulative",
	},
	{ type: "number", field: "inIcuCurrently", headerName: "InIcuCurrently" },
	{ type: "number", field: "inIcuCumulative", headerName: "InIcuCumulative" },
	{
		type: "number",
		field: "onVentilatorCurrently",
		headerName: "OnVentilatorCurrently",
	},
	{
		type: "number",
		field: "onVentilatorCumulative",
		headerName: "OnVentilatorCumulative",
	},
	{ type: "number", field: "recovered", headerName: "Recovered" },
	{ type: "string", field: "dateChecked", headerName: "DateChecked" },
	{ type: "number", field: "death", headerName: "Death" },
	{ type: "number", field: "hospitalized", headerName: "Hospitalized" },
	{ type: "string", field: "lastModified", headerName: "LastModified" },
	{ type: "number", field: "total", headerName: "Total" },
	{ type: "number", field: "totalTestResults", headerName: "TotalTestResults" },
	{ type: "number", field: "posNeg", headerName: "PosNeg" },
	{ type: "number", field: "deathIncrease", headerName: "DeathIncrease" },
	{
		type: "number",
		field: "hospitalizedIncrease",
		headerName: "HospitalizedIncrease",
	},
	{ type: "number", field: "negativeIncrease", headerName: "NegativeIncrease" },
	{ type: "number", field: "positiveIncrease", headerName: "PositiveIncrease" },
	{
		type: "number",
		field: "totalTestResultsIncrease",
		headerName: "TotalTestResultsIncrease",
	},
];

const exporters: IDataGridExporter<unknown>[] = [
	{
		id: "excel",
		label: "Excel",
		workingLabel: "Running excel export...",
		readyLabel: "Excel spreadsheet is ready to download",
		errorLabel: "Excel export failed",
		onRequest: (
			quickFilter: string,
			additionalFilters: DataGridAdditionalFilters,
			fieldFilter: IDataGridFieldFilter,
			sort: DataGridSortSetting[]
		) => {
			action("onRequest")(quickFilter, additionalFilters, fieldFilter, sort);
			return new Promise((resolve, reject) => {
				window.setTimeout(() => {
					if (Math.random() > 0.5) {
						reject(new Error("Bad luck"));
					} else {
						resolve(Math.random().toString());
					}
				}, 5000);
			});
		},
		onDownload: action("onDownload"),
	},
];

export const DataGridStory = (): React.ReactElement => {
	const classes = useStyles();

	return (
		<div className={classes.wrapper}>
			<DataGrid
				columns={columnDef}
				searchPlaceholder={text("Search placeholder", "")}
				onAddNew={
					boolean("Enable add new", true) ? action("onAddNew") : undefined
				}
				onEdit={boolean("Enable edit", true) ? action("onEdit") : undefined}
				onDelete={
					boolean("Enable delete", true) ? action("onDelete") : undefined
				}
				filterBar={
					boolean("Enable custom filters?", true)
						? GridCustomFilters
						: undefined
				}
				loadData={({
					page,
					rows,
					quickFilter,
					additionalFilters,
					fieldFilter,
					sort,
				}): DataGridData => {
					const rowsPerPage = rows;

					action("loadData")({
						page,
						rowsPerPage,
						quickFilter,
						additionalFilters,
						fieldFilter,
						sort,
					});

					let rowData: DataGridRowData[] = data.map((entry) => ({
						id: entry.hash,
						...entry,
					}));

					// quickfilter
					if (quickFilter) {
						rowData = rowData.filter((row) => {
							for (const key in row) {
								if (!Object.prototype.hasOwnProperty.call(row, key)) continue;
								const value = row[key];
								if (
									value !== null &&
									value
										.toString()
										.toLowerCase()
										.includes(quickFilter.toLowerCase())
								) {
									return true;
								}
							}
							return false;
						});
					}

					// field filter
					for (const filterField in fieldFilter) {
						if (
							!Object.prototype.hasOwnProperty.call(fieldFilter, filterField)
						) {
							continue;
						}
						let filter: IFilterDef | undefined = fieldFilter[filterField];
						const column = columnDef.find((e) => e.field === filterField);
						if (!column) throw new Error("Non-null assertion failed");

						const filterCache: { [key: string]: IFilterDef } = {};
						let filterIndex = 0;

						let expr = "";
						while (filter) {
							filter.value1 = filter.value1.toLowerCase();
							filter.value2 = filter.value2.toLowerCase();
							filterIndex++;
							const filterKey = filterIndex.toString();
							filterCache[filterKey] = filter;
							switch (filter.type) {
								case "contains":
									expr +=
										'value.includes(filterCache["' + filterKey + '"].value1)';
									break;
								case "notContains":
									expr +=
										'!value.includes(filterCache["' + filterKey + '"].value1)';
									break;
								case "equals":
									if (column.type === "number") {
										expr +=
											'parseInt(value) === parseInt(filterCache["' +
											filterKey +
											'"].value1)';
									} else {
										expr += 'value === filterCache["' + filterKey + '"].value1';
									}
									break;
								case "notEqual":
									if (column.type === "number") {
										expr +=
											'parseInt(value) !== parseInt(filterCache["' +
											filterKey +
											'"].value1)';
									} else {
										expr += 'value !== filterCache["' + filterKey + '"].value1';
									}
									break;
								case "startsWith":
									expr +=
										'value.startsWith(filterCache["' + filterKey + '"].value1)';
									break;
								case "endsWith":
									expr +=
										'value.endsWith(filterCache["' + filterKey + '"].value1)';
									break;
								case "lessThan":
									expr +=
										'parseInt(value) < parseInt(filterCache["' +
										filterKey +
										'"].value1)';
									break;
								case "lessThanOrEqual":
									expr +=
										'parseInt(value) <= parseInt(filterCache["' +
										filterKey +
										'"].value1)';
									break;
								case "greaterThan":
									expr +=
										'parseInt(value) > parseInt(filterCache["' +
										filterKey +
										'"].value1)';
									break;
								case "greaterThanOrEqual":
									expr +=
										'parseInt(value) >= parseInt(filterCache["' +
										filterKey +
										'"].value1)';
									break;
								case "inRange":
									expr +=
										'parseInt(value) >= parseInt(filterCache["' +
										filterKey +
										'"].value1) && parseInt(value) <= parseInt(filterCache["' +
										filterKey +
										'"].value2)';
									break;
							}

							filter = filter.nextFilter;
							if (filter)
								expr += filter.nextFilterType === "and" ? " && " : " || ";
						}

						rowData = rowData.filter((row) => {
							const rawValue = row[filterField];
							if (!rawValue) return false;
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const value = rawValue.toString().toLowerCase();

							try {
								// eslint-disable-next-line no-eval
								return !expr || eval(expr);
							} catch (e) {
								// eslint-disable-next-line no-console
								console.error("[Components-Care] [DataGrid] Filter error:", e);
								return false;
							}
						});
					}

					// sort
					rowData.sort((a, b) => {
						for (const sorter of sort) {
							const valA = a[sorter.field];
							const valB = b[sorter.field];
							let res = 0;
							if (typeof valA === "number" && typeof valB === "number") {
								res = valA - valB;
							} else if (valA && valB) {
								const av = valA.toString();
								const bv = valB.toString();
								res = av.localeCompare(bv);
							} else {
								if (!valA && !valB) res = 0;
								else if (!valA) res = -1;
								else if (!valB) res = 1;
							}
							res *= sorter.direction;
							if (res) return res;
						}
						return 0;
					});

					// pagination
					const pageIndex = page - 1;
					const rowsTotal = rowData.length;
					rowData = rowData.splice(pageIndex * rowsPerPage, rowsPerPage);

					return {
						rowsTotal,
						rows: rowData,
					};
				}}
				exporters={boolean("Enable export", true) ? exporters : undefined}
			/>
		</div>
	);
};

DataGridStory.storyName = "Basic";
DataGridStory.decorators = [withActions, withKnobs];
