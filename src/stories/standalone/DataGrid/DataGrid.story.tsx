import React from "react";
import "../../../i18n";
import { boolean, number, text } from "@storybook/addon-knobs";
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
import { action } from "@storybook/addon-actions";
import { IDataGridExporter } from "../../../standalone/DataGrid/Header";
import data from "./covid-daily.json";
import GridCustomFilters from "./GridCustomFilters";
import { filterSortPaginate } from "../../../utils";
import { useTheme } from "@material-ui/core";

const useStyles = makeStyles({
	wrapper: {
		width: "90vw",
		height: "90vh",
	},
});

const columnDef: IDataGridColumnDef[] = ([
	{
		type: "enum",
		filterData: new Array(10).fill(null).map((_, index) => ({
			value: `${20200819 - index}`,
			getLabelText: () => `Value ${index}`,
		})),
		field: "date",
		headerName: "Date",
	},
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
] as IDataGridColumnDef[]).map((entry) => ({
	...entry,
	filterable:
		entry.type === "number" ||
		entry.type === "string" ||
		entry.type === "enum" ||
		entry.type === "boolean",
	sortable: entry.type === "number" || entry.type === "string",
}));

const exporters: IDataGridExporter<unknown>[] = [
	{
		id: "excel",
		getLabel: () => "Excel",
		getWorkingLabel: () => "Running excel export...",
		getReadyLabel: () => "Excel spreadsheet is ready to download",
		getErrorLabel: () => "Excel export failed",
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
	const theme = useTheme();

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
				enableDeleteAll={boolean("Enable select all", true)}
				filterBar={
					boolean("Enable custom filters?", true)
						? GridCustomFilters
						: undefined
				}
				enableFilterDialogMediaQuery={theme.breakpoints.down("md")}
				onSelectionChange={action("onSelectionChange")}
				prohibitMultiSelect={boolean("Prohibit multi select", false)}
				filterLimit={
					boolean("Enable filter limit", false)
						? number("Filter limit", 1)
						: undefined
				}
				sortLimit={
					boolean("Enable sort limit", false)
						? number("Sort limit", 1)
						: undefined
				}
				loadData={(params): DataGridData => {
					action("loadData")(params);

					const rowData: DataGridRowData[] = data.map((entry) => ({
						id: entry.hash,
						...entry,
					}));

					const processed = filterSortPaginate(rowData, params, columnDef);

					return {
						rowsTotal: data.length,
						rowsFiltered: processed[1],
						rows: processed[0],
					};
				}}
				exporters={boolean("Enable export", true) ? exporters : undefined}
			/>
		</div>
	);
};

DataGridStory.storyName = "Basic";
