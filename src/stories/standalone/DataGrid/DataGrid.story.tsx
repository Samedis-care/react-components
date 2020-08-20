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
import { action } from "@storybook/addon-actions";
import { IDataGridExporter } from "../../../standalone/DataGrid/Header";

export default {
	title: "Standalone/DataGrid",
	component: DataGrid,
	decorators: [withKnobs],
};

const useStyles = makeStyles({
	wrapper: {
		width: "90vw",
		height: "90vh",
	},
});

const columnDef: IDataGridColumnDef[] = new Array(30)
	.fill(undefined)
	.map((_, index) => ({
		field: "field_" + index,
		headerName: "Field number " + index,
	}));

const generateRow = (id: number): DataGridRowData => {
	const ret: DataGridRowData = { id: id.toString() };
	columnDef.forEach((column, colIndex) => {
		ret[column.field] = `Y ${id} X ${colIndex}`;
	});
	return ret;
};

const exporters: IDataGridExporter<any>[] = [
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

export const DataGridStory = () => {
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
				loadData={async (
					page,
					rowsPerPage,
					quickFilter,
					additionalFilters,
					fieldFilter,
					sort
				): Promise<DataGridData> => {
					action("loadData")({
						page,
						rowsPerPage,
						quickFilter,
						additionalFilters,
						fieldFilter,
						sort,
					});

					return {
						rowsTotal: 4 * rowsPerPage,
						rows: new Array(rowsPerPage)
							.fill(undefined)
							.map((_, index) => generateRow((page - 1) * rowsPerPage + index)),
					};
				}}
				exporters={boolean("Enable export", true) ? exporters : undefined}
			/>
		</div>
	);
};

DataGridStory.story = {
	name: "Basic",
};
